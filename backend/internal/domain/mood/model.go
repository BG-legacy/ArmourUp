package mood

import (
	"time"

	"gorm.io/gorm"
)

// MoodEntry represents a daily emotional/spiritual check-in
type MoodEntry struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	UserID          uint           `json:"user_id"`
	EmotionalState  string         `json:"emotional_state" binding:"required"`
	SpiritualState  string         `json:"spiritual_state" binding:"required"`
	EnergyLevel     int            `json:"energy_level" binding:"required,min=1,max=10"`
	Gratitude       string         `json:"gratitude"`
	Notes           string         `json:"notes"`
	Date            time.Time      `json:"date" gorm:"type:date"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// CreateMoodEntryRequest represents the request to create a new mood entry
type CreateMoodEntryRequest struct {
	EmotionalState string `json:"emotional_state" binding:"required"`
	SpiritualState string `json:"spiritual_state" binding:"required"`
	EnergyLevel    int    `json:"energy_level" binding:"required,min=1,max=10"`
	Gratitude      string `json:"gratitude"`
	Notes          string `json:"notes"`
	Date           string `json:"date"` // Optional, defaults to today
}

// UpdateMoodEntryRequest represents the request to update an existing mood entry
type UpdateMoodEntryRequest struct {
	EmotionalState string `json:"emotional_state"`
	SpiritualState string `json:"spiritual_state"`
	EnergyLevel    int    `json:"energy_level" binding:"omitempty,min=1,max=10"`
	Gratitude      string `json:"gratitude"`
	Notes          string `json:"notes"`
}

// MoodTrendStats represents aggregated mood statistics for trends
type MoodTrendStats struct {
	Period          string  `json:"period"`
	AvgEnergyLevel  float64 `json:"avg_energy_level"`
	EmotionalStates map[string]int `json:"emotional_states"`
	SpiritualStates map[string]int `json:"spiritual_states"`
	TotalEntries    int     `json:"total_entries"`
}


