package prayer

import (
	"time"

	"gorm.io/gorm"
)

type PrayerRequest struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	UserID          uint           `json:"-" gorm:"index"` // Hidden from JSON for anonymity
	Request         string         `json:"request" binding:"required"`
	IsAnonymous     bool           `json:"is_anonymous" gorm:"default:true"`
	PrayerCount     int            `json:"prayer_count" gorm:"default:0"`
	Status          string         `json:"status" gorm:"default:pending"` // pending, answered, closed
	AnsweredAt      *time.Time     `json:"answered_at,omitempty"`
	AnswerTestimony string         `json:"answer_testimony,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// PrayerLog tracks individual prayers by users
type PrayerLog struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	PrayerRequestID  uint      `json:"prayer_request_id" gorm:"index"`
	UserID           uint      `json:"user_id" gorm:"index"`
	PrayedAt         time.Time `json:"prayed_at"`
	PrayerRequest    *PrayerRequest `json:"prayer_request,omitempty" gorm:"foreignKey:PrayerRequestID"`
}

// CreatePrayerRequestDTO represents the data needed to create a prayer request
type CreatePrayerRequestDTO struct {
	Request     string `json:"request" binding:"required"`
	IsAnonymous bool   `json:"is_anonymous"`
}

// MarkAnsweredDTO represents the data needed to mark a prayer as answered
type MarkAnsweredDTO struct {
	Testimony string `json:"testimony" binding:"required"`
}

