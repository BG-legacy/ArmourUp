package user

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username     string `json:"username" gorm:"unique;not null"`
	Email        string `json:"email" gorm:"unique;not null"`
	PasswordHash string `json:"-" gorm:"column:password_hash;not null"`
}
