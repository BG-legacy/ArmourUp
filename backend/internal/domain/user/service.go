package user

import (
	"errors"
)

type Service interface {
	CreateUser(user *User) error
	GetUserByID(id uint) (*User, error)
	GetUserByEmail(email string) (*User, error)
	UpdateUser(user *User) error
	DeleteUser(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateUser(user *User) error {
	// Check if user with same email exists
	existingUser, err := s.repo.FindByEmail(user.Email)
	if err == nil && existingUser != nil {
		return errors.New("user with this email already exists")
	}

	return s.repo.Create(user)
}

func (s *service) GetUserByID(id uint) (*User, error) {
	return s.repo.FindByID(id)
}

func (s *service) GetUserByEmail(email string) (*User, error) {
	return s.repo.FindByEmail(email)
}

func (s *service) UpdateUser(user *User) error {
	// Check if user exists
	existingUser, err := s.repo.FindByID(user.ID)
	if err != nil {
		return err
	}
	if existingUser == nil {
		return errors.New("user not found")
	}

	return s.repo.Update(user)
}

func (s *service) DeleteUser(id uint) error {
	// Check if user exists
	existingUser, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if existingUser == nil {
		return errors.New("user not found")
	}

	return s.repo.Delete(id)
} 