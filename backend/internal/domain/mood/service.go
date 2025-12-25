package mood

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// CreateEntry creates a new mood entry for a user
func (s *Service) CreateEntry(userID uint, req CreateMoodEntryRequest) (*MoodEntry, error) {
	// Parse date or use today
	var entryDate time.Time
	var err error
	if req.Date != "" {
		entryDate, err = time.Parse("2006-01-02", req.Date)
		if err != nil {
			return nil, errors.New("invalid date format, use YYYY-MM-DD")
		}
	} else {
		entryDate = time.Now().UTC().Truncate(24 * time.Hour)
	}

	// Check if entry already exists for this date
	existing, err := s.repo.GetTodayEntry(userID, entryDate)
	if err == nil && existing.ID > 0 {
		return nil, errors.New("mood entry for this date already exists")
	}

	entry := &MoodEntry{
		UserID:         userID,
		EmotionalState: req.EmotionalState,
		SpiritualState: req.SpiritualState,
		EnergyLevel:    req.EnergyLevel,
		Gratitude:      req.Gratitude,
		Notes:          req.Notes,
		Date:           entryDate,
	}

	if err := s.repo.Create(entry); err != nil {
		return nil, err
	}

	return entry, nil
}

// GetEntry retrieves a specific mood entry
func (s *Service) GetEntry(id uint) (*MoodEntry, error) {
	return s.repo.GetByID(id)
}

// GetUserEntries retrieves all mood entries for a user
func (s *Service) GetUserEntries(userID uint) ([]MoodEntry, error) {
	return s.repo.GetByUserID(userID)
}

// GetEntriesInRange retrieves mood entries for a user within a date range
func (s *Service) GetEntriesInRange(userID uint, startDate, endDate time.Time) ([]MoodEntry, error) {
	return s.repo.GetByUserIDAndDateRange(userID, startDate, endDate)
}

// GetTodayEntry retrieves today's mood entry for a user
func (s *Service) GetTodayEntry(userID uint) (*MoodEntry, error) {
	today := time.Now().UTC().Truncate(24 * time.Hour)
	entry, err := s.repo.GetTodayEntry(userID, today)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no entry found for today")
		}
		return nil, err
	}
	return entry, nil
}

// UpdateEntry updates an existing mood entry
func (s *Service) UpdateEntry(id, userID uint, req UpdateMoodEntryRequest) (*MoodEntry, error) {
	entry, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("mood entry not found")
	}

	// Ensure the user owns this entry
	if entry.UserID != userID {
		return nil, errors.New("unauthorized to update this entry")
	}

	// Update fields if provided
	if req.EmotionalState != "" {
		entry.EmotionalState = req.EmotionalState
	}
	if req.SpiritualState != "" {
		entry.SpiritualState = req.SpiritualState
	}
	if req.EnergyLevel > 0 {
		entry.EnergyLevel = req.EnergyLevel
	}
	entry.Gratitude = req.Gratitude
	entry.Notes = req.Notes

	if err := s.repo.Update(entry); err != nil {
		return nil, err
	}

	return entry, nil
}

// DeleteEntry deletes a mood entry
func (s *Service) DeleteEntry(id, userID uint) error {
	entry, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("mood entry not found")
	}

	// Ensure the user owns this entry
	if entry.UserID != userID {
		return errors.New("unauthorized to delete this entry")
	}

	return s.repo.Delete(id)
}

// GetRecentEntries retrieves the most recent mood entries
func (s *Service) GetRecentEntries(userID uint, limit int) ([]MoodEntry, error) {
	return s.repo.GetRecentEntries(userID, limit)
}

// GetMoodTrends calculates mood trends for a user over a period
func (s *Service) GetMoodTrends(userID uint, days int) (*MoodTrendStats, error) {
	endDate := time.Now().UTC()
	startDate := endDate.AddDate(0, 0, -days)

	entries, err := s.repo.GetByUserIDAndDateRange(userID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	if len(entries) == 0 {
		return &MoodTrendStats{
			Period:          startDate.Format("2006-01-02") + " to " + endDate.Format("2006-01-02"),
			AvgEnergyLevel:  0,
			EmotionalStates: make(map[string]int),
			SpiritualStates: make(map[string]int),
			TotalEntries:    0,
		}, nil
	}

	// Calculate statistics
	var totalEnergy int
	emotionalStates := make(map[string]int)
	spiritualStates := make(map[string]int)

	for _, entry := range entries {
		totalEnergy += entry.EnergyLevel
		emotionalStates[entry.EmotionalState]++
		spiritualStates[entry.SpiritualState]++
	}

	avgEnergy := float64(totalEnergy) / float64(len(entries))

	return &MoodTrendStats{
		Period:          startDate.Format("2006-01-02") + " to " + endDate.Format("2006-01-02"),
		AvgEnergyLevel:  avgEnergy,
		EmotionalStates: emotionalStates,
		SpiritualStates: spiritualStates,
		TotalEntries:    len(entries),
	}, nil
}

