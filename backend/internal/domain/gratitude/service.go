package gratitude

import (
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateEntry(entry *GratitudeEntry) error {
	return s.repo.Create(entry)
}

func (s *Service) GetEntry(id uint) (*GratitudeEntry, error) {
	return s.repo.GetByID(id)
}

func (s *Service) GetUserEntries(userID uint) ([]GratitudeEntry, error) {
	return s.repo.GetByUserID(userID)
}

func (s *Service) GetAllEntries() ([]GratitudeEntry, error) {
	return s.repo.GetAll()
}

func (s *Service) GetTodayEntry(userID uint) (*GratitudeEntry, error) {
	return s.repo.GetTodayEntry(userID)
}

func (s *Service) GetRecentEntries(userID uint, limit int) ([]GratitudeEntry, error) {
	return s.repo.GetRecent(userID, limit)
}

func (s *Service) GetEntriesInRange(userID uint, startDate, endDate time.Time) ([]GratitudeEntry, error) {
	return s.repo.GetByDateRange(userID, startDate, endDate)
}

func (s *Service) GetByCategory(userID uint, category string) ([]GratitudeEntry, error) {
	return s.repo.GetByCategory(userID, category)
}

func (s *Service) UpdateEntry(entry *GratitudeEntry) error {
	return s.repo.Update(entry)
}

func (s *Service) DeleteEntry(id uint) error {
	return s.repo.Delete(id)
}



