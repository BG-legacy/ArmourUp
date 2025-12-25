package prayer

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

func (r *Repository) Create(prayerRequest *PrayerRequest) error {
	return r.db.Create(prayerRequest).Error
}

func (r *Repository) GetByID(id uint) (*PrayerRequest, error) {
	var prayerRequest PrayerRequest
	err := r.db.First(&prayerRequest, id).Error
	return &prayerRequest, err
}

func (r *Repository) GetAll() ([]PrayerRequest, error) {
	var prayerRequests []PrayerRequest
	err := r.db.Order("created_at DESC").Find(&prayerRequests).Error
	return prayerRequests, err
}

func (r *Repository) GetByUserID(userID uint) ([]PrayerRequest, error) {
	var prayerRequests []PrayerRequest
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&prayerRequests).Error
	return prayerRequests, err
}

func (r *Repository) Update(prayerRequest *PrayerRequest) error {
	return r.db.Save(prayerRequest).Error
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&PrayerRequest{}, id).Error
}

func (r *Repository) IncrementPrayerCount(id uint) error {
	return r.db.Model(&PrayerRequest{}).Where("id = ?", id).Update("prayer_count", gorm.Expr("prayer_count + 1")).Error
}

// Prayer Log methods

func (r *Repository) CreatePrayerLog(log *PrayerLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) HasUserPrayed(prayerRequestID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&PrayerLog{}).
		Where("prayer_request_id = ? AND user_id = ?", prayerRequestID, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *Repository) GetPrayerLogsByUser(userID uint) ([]PrayerLog, error) {
	var logs []PrayerLog
	err := r.db.Preload("PrayerRequest").
		Where("user_id = ?", userID).
		Order("prayed_at DESC").
		Find(&logs).Error
	return logs, err
}

func (r *Repository) GetPrayerLogsByRequest(prayerRequestID uint) ([]PrayerLog, error) {
	var logs []PrayerLog
	err := r.db.Where("prayer_request_id = ?", prayerRequestID).
		Order("prayed_at DESC").
		Find(&logs).Error
	return logs, err
}

// Answer methods

func (r *Repository) MarkAsAnswered(id uint, testimony string) error {
	now := time.Now()
	return r.db.Model(&PrayerRequest{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":           "answered",
			"answered_at":      now,
			"answer_testimony": testimony,
		}).Error
}

func (r *Repository) GetAnsweredPrayers() ([]PrayerRequest, error) {
	var prayerRequests []PrayerRequest
	err := r.db.Where("status = ?", "answered").
		Order("answered_at DESC").
		Find(&prayerRequests).Error
	return prayerRequests, err
}

