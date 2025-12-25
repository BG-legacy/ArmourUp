package insights

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

// Create saves a new progress insight
func (r *Repository) Create(insight *ProgressInsight) error {
	return r.db.Create(insight).Error
}

// GetByID retrieves a progress insight by ID
func (r *Repository) GetByID(id uint) (*ProgressInsight, error) {
	var insight ProgressInsight
	err := r.db.First(&insight, id).Error
	return &insight, err
}

// GetByUserID retrieves all progress insights for a specific user
func (r *Repository) GetByUserID(userID uint) ([]ProgressInsight, error) {
	var insights []ProgressInsight
	err := r.db.Where("user_id = ?", userID).Order("period DESC").Find(&insights).Error
	return insights, err
}

// GetByUserAndPeriod retrieves an insight for a specific user and period
func (r *Repository) GetByUserAndPeriod(userID uint, period string) (*ProgressInsight, error) {
	var insight ProgressInsight
	err := r.db.Where("user_id = ? AND period = ?", userID, period).First(&insight).Error
	return &insight, err
}

// Update updates an existing progress insight
func (r *Repository) Update(insight *ProgressInsight) error {
	return r.db.Save(insight).Error
}

// Delete soft deletes a progress insight
func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&ProgressInsight{}, id).Error
}

// GetMoodDataForPeriod retrieves mood data for a specific period
func (r *Repository) GetMoodDataForPeriod(userID uint, startDate, endDate time.Time) ([]MoodSummary, error) {
	var moods []MoodSummary
	err := r.db.Table("mood_entries").
		Select("date, emotional_state, spiritual_state, energy_level, notes").
		Where("user_id = ? AND date >= ? AND date <= ? AND deleted_at IS NULL", userID, startDate, endDate).
		Order("date ASC").
		Scan(&moods).Error
	return moods, err
}

// GetJournalDataForPeriod retrieves journal data for a specific period
func (r *Repository) GetJournalDataForPeriod(userID uint, startDate, endDate time.Time) ([]JournalSummary, error) {
	var journals []JournalSummary
	err := r.db.Table("journal_entries").
		Select("created_at as date, content").
		Where("user_id = ? AND created_at >= ? AND created_at <= ? AND deleted_at IS NULL", userID, startDate, endDate).
		Order("created_at ASC").
		Scan(&journals).Error
	return journals, err
}

// GetGratitudeCountForPeriod counts gratitude entries for a specific period
func (r *Repository) GetGratitudeCountForPeriod(userID uint, startDate, endDate time.Time) (int64, error) {
	var count int64
	err := r.db.Table("gratitude_entries").
		Where("user_id = ? AND created_at >= ? AND created_at <= ? AND deleted_at IS NULL", userID, startDate, endDate).
		Count(&count).Error
	return count, err
}

// GetPrayerStatsForPeriod retrieves prayer statistics for a specific period
func (r *Repository) GetPrayerStatsForPeriod(userID uint, startDate, endDate time.Time) (int64, int64, error) {
	// Count prayers the user prayed for
	var prayersOffered int64
	err := r.db.Table("prayer_logs").
		Where("user_id = ? AND prayed_at >= ? AND prayed_at <= ?", userID, startDate, endDate).
		Count(&prayersOffered).Error
	if err != nil {
		return 0, 0, err
	}

	// Count prayers the user created that were answered
	var prayersAnswered int64
	err = r.db.Table("prayer_requests").
		Where("user_id = ? AND status = ? AND answered_at >= ? AND answered_at <= ? AND deleted_at IS NULL", userID, "answered", startDate, endDate).
		Count(&prayersAnswered).Error
	if err != nil {
		return prayersOffered, 0, err
	}

	return prayersOffered, prayersAnswered, nil
}
