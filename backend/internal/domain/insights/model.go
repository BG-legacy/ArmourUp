package insights

import (
	"time"

	"gorm.io/gorm"
)

// ProgressInsight represents an AI-generated monthly summary of spiritual growth
type ProgressInsight struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id"`
	Period      string         `json:"period"` // Format: "2024-01" for January 2024
	Summary     string         `json:"summary"`
	Highlights  string         `json:"highlights"`
	Areas       string         `json:"areas" gorm:"column:areas"`
	Verse       string         `json:"verse"`
	MoodStats   string         `json:"mood_stats" gorm:"column:mood_stats"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// InsightData represents aggregated data used to generate insights
type InsightData struct {
	Period          string
	MoodEntries     []MoodSummary
	JournalEntries  []JournalSummary
	GratitudeCount  int
	PrayersOffered  int
	PrayersAnswered int
	AvgEnergyLevel  float64
	TopEmotions     map[string]int
	TopSpiritual    map[string]int
}

// MoodSummary represents summarized mood data
type MoodSummary struct {
	Date           time.Time
	EmotionalState string
	SpiritualState string
	EnergyLevel    int
	Notes          string
}

// JournalSummary represents summarized journal data
type JournalSummary struct {
	Date    time.Time
	Content string
}

// GenerateInsightRequest represents the request to generate a new insight
type GenerateInsightRequest struct {
	Period string `json:"period" binding:"required"` // Format: "2024-01"
}

// InsightResponse represents the response with insight data
type InsightResponse struct {
	Insight *ProgressInsight `json:"insight"`
	Message string           `json:"message,omitempty"`
}

