package prayerchain

import (
	"time"

	"gorm.io/gorm"
)

type PrayerChain struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Name            string         `json:"name" binding:"required" gorm:"not null"`
	Description     string         `json:"description"`
	CreatedByUserID uint           `json:"created_by_user_id" gorm:"not null;index"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relations
	Members     []ChainMember     `json:"members,omitempty" gorm:"foreignKey:ChainID"`
	CreatedBy   interface{}       `json:"created_by,omitempty" gorm:"-"` // Will be populated with user info
}

type ChainMember struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	ChainID   uint           `json:"chain_id" gorm:"not null;index"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relations
	User              interface{}         `json:"user,omitempty" gorm:"-"` // Will be populated with user info
	PrayerCommitments []PrayerCommitment   `json:"prayer_commitments,omitempty" gorm:"foreignKey:MemberID"`
}

type PrayerCommitment struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	ChainID        uint           `json:"chain_id" gorm:"not null;index"`
	MemberID       uint           `json:"member_id" gorm:"not null;index"`
	PrayForUserID  uint           `json:"pray_for_user_id" gorm:"not null;index"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relations
	PrayForUser interface{} `json:"pray_for_user,omitempty" gorm:"-"` // Will be populated with user info
}

// DTOs
type CreatePrayerChainDTO struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type JoinChainDTO struct {
	ChainID uint `json:"chain_id" binding:"required"`
}

type CommitToPrayDTO struct {
	ChainID       uint   `json:"chain_id" binding:"required"`
	PrayForUserID uint   `json:"pray_for_user_id" binding:"required"`
}

// Response DTOs with populated relations
type PrayerChainResponse struct {
	ID              uint                    `json:"id"`
	Name            string                  `json:"name"`
	Description     string                  `json:"description"`
	CreatedByUserID uint                    `json:"created_by_user_id"`
	CreatedAt       time.Time               `json:"created_at"`
	UpdatedAt       time.Time               `json:"updated_at"`
	Members         []ChainMemberResponse   `json:"members"`
	CreatedBy       interface{}             `json:"created_by,omitempty"`
}

type ChainMemberResponse struct {
	ID              uint                      `json:"id"`
	ChainID         uint                      `json:"chain_id"`
	UserID          uint                      `json:"user_id"`
	CreatedAt       time.Time                 `json:"created_at"`
	User            interface{}               `json:"user,omitempty"`
	PrayerCommitments []PrayerCommitmentResponse `json:"prayer_commitments,omitempty"`
}

type PrayerCommitmentResponse struct {
	ID            uint        `json:"id"`
	ChainID       uint        `json:"chain_id"`
	MemberID      uint        `json:"member_id"`
	PrayForUserID uint        `json:"pray_for_user_id"`
	CreatedAt     time.Time   `json:"created_at"`
	PrayForUser   interface{} `json:"pray_for_user,omitempty"`
}






