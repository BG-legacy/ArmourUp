package journal

import (
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(entry *JournalEntry) error {
	return r.db.Create(entry).Error
}

func (r *Repository) GetByID(id uint) (*JournalEntry, error) {
	var entry JournalEntry
	err := r.db.First(&entry, id).Error
	return &entry, err
}

func (r *Repository) GetAll() ([]JournalEntry, error) {
	var entries []JournalEntry
	err := r.db.Find(&entries).Error
	return entries, err
}

func (r *Repository) Update(entry *JournalEntry) error {
	return r.db.Save(entry).Error
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&JournalEntry{}, id).Error
} 