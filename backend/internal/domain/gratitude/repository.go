package gratitude

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

func (r *Repository) Create(entry *GratitudeEntry) error {
	return r.db.Create(entry).Error
}

func (r *Repository) GetByID(id uint) (*GratitudeEntry, error) {
	var entry GratitudeEntry
	err := r.db.First(&entry, id).Error
	return &entry, err
}

func (r *Repository) GetByUserID(userID uint) ([]GratitudeEntry, error) {
	var entries []GratitudeEntry
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&entries).Error
	return entries, err
}

func (r *Repository) GetAll() ([]GratitudeEntry, error) {
	var entries []GratitudeEntry
	err := r.db.Order("created_at DESC").Find(&entries).Error
	return entries, err
}

func (r *Repository) GetTodayEntry(userID uint) (*GratitudeEntry, error) {
	var entry GratitudeEntry
	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)
	
	err := r.db.Where("user_id = ? AND created_at >= ? AND created_at < ?", userID, today, tomorrow).
		Order("created_at DESC").
		First(&entry).Error
	
	return &entry, err
}

func (r *Repository) GetRecent(userID uint, limit int) ([]GratitudeEntry, error) {
	var entries []GratitudeEntry
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&entries).Error
	return entries, err
}

func (r *Repository) GetByDateRange(userID uint, startDate, endDate time.Time) ([]GratitudeEntry, error) {
	var entries []GratitudeEntry
	err := r.db.Where("user_id = ? AND created_at >= ? AND created_at <= ?", userID, startDate, endDate).
		Order("created_at DESC").
		Find(&entries).Error
	return entries, err
}

func (r *Repository) Update(entry *GratitudeEntry) error {
	return r.db.Save(entry).Error
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&GratitudeEntry{}, id).Error
}

func (r *Repository) GetByCategory(userID uint, category string) ([]GratitudeEntry, error) {
	var entries []GratitudeEntry
	err := r.db.Where("user_id = ? AND category = ?", userID, category).
		Order("created_at DESC").
		Find(&entries).Error
	return entries, err
}

