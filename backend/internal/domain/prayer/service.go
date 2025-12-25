package prayer

import (
	"errors"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreatePrayerRequest(userID uint, dto *CreatePrayerRequestDTO) (*PrayerRequest, error) {
	prayerRequest := &PrayerRequest{
		UserID:      userID,
		Request:     dto.Request,
		IsAnonymous: dto.IsAnonymous,
		PrayerCount: 0,
		Status:      "pending",
	}
	
	if err := s.repo.Create(prayerRequest); err != nil {
		return nil, err
	}
	
	return prayerRequest, nil
}

func (s *Service) GetPrayerRequest(id uint) (*PrayerRequest, error) {
	return s.repo.GetByID(id)
}

func (s *Service) GetAllPrayerRequests() ([]PrayerRequest, error) {
	return s.repo.GetAll()
}

func (s *Service) GetUserPrayerRequests(userID uint) ([]PrayerRequest, error) {
	return s.repo.GetByUserID(userID)
}

func (s *Service) UpdatePrayerRequest(prayerRequest *PrayerRequest) error {
	return s.repo.Update(prayerRequest)
}

func (s *Service) DeletePrayerRequest(id uint) error {
	return s.repo.Delete(id)
}

// PrayForRequest tracks individual prayers and prevents duplicate prayers
func (s *Service) PrayForRequest(prayerRequestID, userID uint) error {
	// Check if user has already prayed
	hasPrayed, err := s.repo.HasUserPrayed(prayerRequestID, userID)
	if err != nil {
		return err
	}
	
	if hasPrayed {
		return errors.New("you have already prayed for this request")
	}
	
	// Create prayer log
	log := &PrayerLog{
		PrayerRequestID: prayerRequestID,
		UserID:          userID,
		PrayedAt:        time.Now(),
	}
	
	if err := s.repo.CreatePrayerLog(log); err != nil {
		return err
	}
	
	// Increment prayer count
	return s.repo.IncrementPrayerCount(prayerRequestID)
}

// GetMyPrayers returns all prayers the user has prayed for
func (s *Service) GetMyPrayers(userID uint) ([]PrayerLog, error) {
	return s.repo.GetPrayerLogsByUser(userID)
}

// GetPrayersForRequest returns all users who prayed for a request
func (s *Service) GetPrayersForRequest(prayerRequestID uint) ([]PrayerLog, error) {
	return s.repo.GetPrayerLogsByRequest(prayerRequestID)
}

// MarkAsAnswered marks a prayer request as answered with testimony
func (s *Service) MarkAsAnswered(prayerRequestID, userID uint, dto *MarkAnsweredDTO) error {
	// Check if the prayer request belongs to the user
	prayerRequest, err := s.repo.GetByID(prayerRequestID)
	if err != nil {
		return err
	}
	
	if prayerRequest.UserID != userID {
		return errors.New("you can only mark your own prayer requests as answered")
	}
	
	if prayerRequest.Status == "answered" {
		return errors.New("this prayer request is already marked as answered")
	}
	
	return s.repo.MarkAsAnswered(prayerRequestID, dto.Testimony)
}

// GetAnsweredPrayers returns all answered prayers
func (s *Service) GetAnsweredPrayers() ([]PrayerRequest, error) {
	return s.repo.GetAnsweredPrayers()
}

