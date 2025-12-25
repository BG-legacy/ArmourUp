package openai

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"armourup/internal/config"

	"github.com/sashabaranov/go-openai"
)

type Service struct {
	client *openai.Client
}

type AIResponse struct {
	Verse   string `json:"verse"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func NewService() (*Service, error) {
	apiKey := config.GetOpenAIAPIKey()
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY environment variable is not set")
	}

	client := openai.NewClient(apiKey)
	return &Service{client: client}, nil
}

// GetClient returns the OpenAI client for use in other services
func (s *Service) GetClient() *openai.Client {
	return s.client
}

func (s *Service) buildPrompt(userInput string) string {
	return fmt.Sprintf(`Based on the following situation or feeling, provide a relevant Bible verse and a brief message of encouragement:
	
Situation: %s

Please respond in JSON format with the following structure:
{
	"verse": "Bible verse with reference",
	"message": "Brief message of encouragement"
}`, userInput)
}

func (s *Service) GetEncouragement(ctx context.Context, userInput string) (*AIResponse, error) {
	prompt := s.buildPrompt(userInput)

	// Retry logic with exponential backoff
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		resp, err := s.client.CreateChatCompletion(
			ctx,
			openai.ChatCompletionRequest{
				Model: openai.GPT3Dot5Turbo,
				Messages: []openai.ChatCompletionMessage{
					{
						Role:    openai.ChatMessageRoleUser,
						Content: prompt,
					},
				},
			},
		)

		if err == nil {
			var aiResponse AIResponse
			if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &aiResponse); err != nil {
				return nil, fmt.Errorf("failed to parse AI response: %v", err)
			}
			return &aiResponse, nil
		}

		// If we've exhausted all retries, return the error
		if attempt == maxRetries-1 {
			return nil, fmt.Errorf("failed after %d attempts: %v", maxRetries, err)
		}

		// Calculate delay with exponential backoff
		delay := baseDelay * time.Duration(1<<uint(attempt))
		time.Sleep(delay)
	}

	return nil, fmt.Errorf("unexpected error in retry logic")
}
