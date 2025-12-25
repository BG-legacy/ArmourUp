package insights

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

type Service struct {
	repo     *Repository
	aiClient *openai.Client
}

func NewService(repo *Repository, aiClient *openai.Client) *Service {
	return &Service{
		repo:     repo,
		aiClient: aiClient,
	}
}

// GenerateInsight creates a new monthly progress insight using AI
func (s *Service) GenerateInsight(userID uint, period string) (*ProgressInsight, error) {
	// Check if insight already exists for this period
	existing, err := s.repo.GetByUserAndPeriod(userID, period)
	if err == nil && existing.ID > 0 {
		return existing, nil // Return cached insight
	}

	// Parse period (format: "2024-01")
	startDate, endDate, err := s.parsePeriod(period)
	if err != nil {
		return nil, err
	}

	// Gather data from various sources
	data, err := s.gatherInsightData(userID, period, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Generate AI insight
	aiResponse, err := s.generateAIInsight(data)
	if err != nil {
		return nil, err
	}

	// Create and save insight
	insight := &ProgressInsight{
		UserID:     userID,
		Period:     period,
		Summary:    aiResponse.Summary,
		Highlights: aiResponse.Highlights,
		Areas:      aiResponse.AreasForGrowth,
		Verse:      aiResponse.Verse,
		MoodStats:  fmt.Sprintf("Avg Energy: %.1f/10", data.AvgEnergyLevel),
	}

	if err := s.repo.Create(insight); err != nil {
		return nil, err
	}

	return insight, nil
}

// GetInsight retrieves a specific progress insight
func (s *Service) GetInsight(id uint) (*ProgressInsight, error) {
	return s.repo.GetByID(id)
}

// GetUserInsights retrieves all progress insights for a user
func (s *Service) GetUserInsights(userID uint) ([]ProgressInsight, error) {
	return s.repo.GetByUserID(userID)
}

// GetInsightForPeriod retrieves or generates an insight for a specific period
func (s *Service) GetInsightForPeriod(userID uint, period string) (*ProgressInsight, error) {
	// Try to get existing insight
	insight, err := s.repo.GetByUserAndPeriod(userID, period)
	if err == nil && insight.ID > 0 {
		return insight, nil
	}

	// Generate new insight if it doesn't exist
	return s.GenerateInsight(userID, period)
}

// parsePeriod converts a period string to start and end dates
func (s *Service) parsePeriod(period string) (time.Time, time.Time, error) {
	// Parse period format "2024-01"
	startDate, err := time.Parse("2006-01", period)
	if err != nil {
		return time.Time{}, time.Time{}, errors.New("invalid period format, use YYYY-MM")
	}

	// Calculate end of month
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	return startDate, endDate, nil
}

// gatherInsightData collects all relevant data for generating insights
func (s *Service) gatherInsightData(userID uint, period string, startDate, endDate time.Time) (*InsightData, error) {
	data := &InsightData{
		Period:       period,
		TopEmotions:  make(map[string]int),
		TopSpiritual: make(map[string]int),
	}

	// Get mood data
	moods, err := s.repo.GetMoodDataForPeriod(userID, startDate, endDate)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	data.MoodEntries = moods

	// Calculate average energy and emotion frequencies
	if len(moods) > 0 {
		totalEnergy := 0
		for _, mood := range moods {
			totalEnergy += mood.EnergyLevel
			data.TopEmotions[mood.EmotionalState]++
			data.TopSpiritual[mood.SpiritualState]++
		}
		data.AvgEnergyLevel = float64(totalEnergy) / float64(len(moods))
	}

	// Get journal data
	journals, err := s.repo.GetJournalDataForPeriod(userID, startDate, endDate)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	data.JournalEntries = journals

	// Get gratitude count
	gratitudeCount, err := s.repo.GetGratitudeCountForPeriod(userID, startDate, endDate)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	data.GratitudeCount = int(gratitudeCount)

	// Get prayer stats
	prayersOffered, prayersAnswered, err := s.repo.GetPrayerStatsForPeriod(userID, startDate, endDate)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	data.PrayersOffered = int(prayersOffered)
	data.PrayersAnswered = int(prayersAnswered)

	return data, nil
}

// AIInsightResponse represents the AI-generated insight structure
type AIInsightResponse struct {
	Summary        string `json:"summary"`
	Highlights     string `json:"highlights"`
	AreasForGrowth string `json:"areas_for_growth"`
	Verse          string `json:"verse"`
}

// generateAIInsight uses OpenAI to generate a meaningful insight
func (s *Service) generateAIInsight(data *InsightData) (*AIInsightResponse, error) {
	prompt := s.buildInsightPrompt(data)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	resp, err := s.aiClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: openai.GPT4TurboPreview,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "You are a compassionate Christian spiritual advisor who provides insightful, encouraging, and biblically-grounded feedback on spiritual growth. You MUST respond ONLY with valid JSON, no other text.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			Temperature: 0.7,
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to generate AI insight: %v", err)
	}

	// Get the response content
	content := resp.Choices[0].Message.Content

	// Clean the response (remove markdown code blocks if present)
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var aiResponse AIInsightResponse
	if err := json.Unmarshal([]byte(content), &aiResponse); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v (content: %s)", err, content)
	}

	return &aiResponse, nil
}

// buildInsightPrompt creates a comprehensive prompt for AI insight generation
func (s *Service) buildInsightPrompt(data *InsightData) string {
	prompt := fmt.Sprintf(`Generate a monthly spiritual growth summary for %s based on the following data:

**Mood & Emotional Data:**
- Total mood entries: %d
- Average energy level: %.1f/10
- Most common emotional states: %v
- Most common spiritual states: %v

**Spiritual Activities:**
- Gratitude entries: %d
- Journal entries: %d
- Prayers offered for others: %d
- Prayers answered: %d

`, data.Period, len(data.MoodEntries), data.AvgEnergyLevel, data.TopEmotions, data.TopSpiritual,
		data.GratitudeCount, len(data.JournalEntries), data.PrayersOffered, data.PrayersAnswered)

	// Add sample journal excerpts if available
	if len(data.JournalEntries) > 0 {
		prompt += "\n**Recent Journal Themes:**\n"
		for i, entry := range data.JournalEntries {
			if i >= 3 { // Only include first 3 entries
				break
			}
			// Truncate long entries
			content := entry.Content
			if len(content) > 200 {
				content = content[:200] + "..."
			}
			prompt += fmt.Sprintf("- %s\n", content)
		}
	}

	// Add mood notes if available
	if len(data.MoodEntries) > 0 {
		prompt += "\n**Notable Mood Notes:**\n"
		count := 0
		for _, mood := range data.MoodEntries {
			if mood.Notes != "" && count < 3 {
				notes := mood.Notes
				if len(notes) > 150 {
					notes = notes[:150] + "..."
				}
				prompt += fmt.Sprintf("- %s\n", notes)
				count++
			}
		}
	}

	prompt += `
Please provide a comprehensive monthly spiritual growth summary in JSON format with the following structure:
{
	"summary": "A 2-3 paragraph overview of their spiritual journey this month, highlighting patterns, growth areas, and God's work in their life",
	"highlights": "3-5 specific positive highlights or breakthrough moments from the month",
	"areas_for_growth": "2-3 gentle, encouraging suggestions for continued spiritual growth",
	"verse": "A relevant Bible verse with reference that speaks to their journey this month"
}

Be encouraging, specific, and Christ-centered. Celebrate their consistency and God's faithfulness.`

	return prompt
}
