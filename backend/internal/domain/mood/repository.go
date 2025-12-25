package mood

import (
	"time"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Create creates a new mood entry
func (r *Repository) Create(entry *MoodEntry) error {
	return r.db.Create(entry).Error
}

// GetByID retrieves a mood entry by ID
func (r *Repository) GetByID(id uint) (*MoodEntry, error) {
	var entry MoodEntry
	err := r.db.First(&entry, id).Error
	return &entry, err
}

// GetByUserID retrieves all mood entries for a specific user
func (r *Repository) GetByUserID(userID uint) ([]MoodEntry, error) {
	var entries []MoodEntry
	err := r.db.Where("user_id = ?", userID).Order("date DESC").Find(&entries).Error
	return entries, err
}

// GetByUserIDAndDateRange retrieves mood entries for a user within a date range
func (r *Repository) GetByUserIDAndDateRange(userID uint, startDate, endDate time.Time) ([]MoodEntry, error) {
	var entries []MoodEntry
	err := r.db.Where("user_id = ? AND date >= ? AND date <= ?", userID, startDate, endDate).
		Order("date DESC").
		Find(&entries).Error
	return entries, err
}

// GetTodayEntry retrieves today's mood entry for a user
func (r *Repository) GetTodayEntry(userID uint, date time.Time) (*MoodEntry, error) {
	var entry MoodEntry
	err := r.db.Where("user_id = ? AND date = ?", userID, date).First(&entry).Error
	return &entry, err
}

// Update updates an existing mood entry
func (r *Repository) Update(entry *MoodEntry) error {
	return r.db.Save(entry).Error
}

// Delete soft deletes a mood entry
func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&MoodEntry{}, id).Error
}

// GetRecentEntries retrieves the most recent N entries for a user
func (r *Repository) GetRecentEntries(userID uint, limit int) ([]MoodEntry, error) {
	var entries []MoodEntry
	err := r.db.Where("user_id = ?", userID).
		Order("date DESC").
		Limit(limit).
		Find(&entries).Error
	return entries, err
}

