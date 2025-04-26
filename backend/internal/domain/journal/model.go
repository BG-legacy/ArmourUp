package journal

import (
	"time"

	"gorm.io/gorm"
)

type JournalEntry struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id"`
	Title     string         `json:"title" binding:"required"`
	Content   string         `json:"content" binding:"required"`
	Mood      string         `json:"mood"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
} 