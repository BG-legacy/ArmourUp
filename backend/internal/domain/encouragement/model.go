package encouragement

import (
	"time"

	"gorm.io/gorm"
)

type Encouragement struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id"`
	Message   string         `json:"message" binding:"required"`
	Type      string         `json:"type" binding:"required"`
	Category  string         `json:"category" binding:"required"`
	Verse     string         `json:"verse"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}
