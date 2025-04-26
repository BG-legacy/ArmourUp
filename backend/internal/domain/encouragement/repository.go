package encouragement

import (
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(encouragement *Encouragement) error {
	return r.db.Create(encouragement).Error
}

func (r *Repository) GetByID(id uint) (*Encouragement, error) {
	var encouragement Encouragement
	err := r.db.First(&encouragement, id).Error
	return &encouragement, err
}

func (r *Repository) GetAll() ([]Encouragement, error) {
	var encouragements []Encouragement
	err := r.db.Find(&encouragements).Error
	return encouragements, err
}

func (r *Repository) Update(encouragement *Encouragement) error {
	return r.db.Save(encouragement).Error
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&Encouragement{}, id).Error
} 