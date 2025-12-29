package gratitude

import (
	"time"

	"gorm.io/gorm"
)

type GratitudeEntry struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id"`
	Title       string         `json:"title" binding:"required"`
	Blessing    string         `json:"blessing" binding:"required"`
	Category    string         `json:"category"`
	Tags        string         `json:"tags"`
	Reflection  string         `json:"reflection"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}



