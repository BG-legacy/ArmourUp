package prayerchain

import (
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(chain *PrayerChain) error {
	return r.db.Create(chain).Error
}

func (r *Repository) GetByID(id uint) (*PrayerChain, error) {
	var chain PrayerChain
	err := r.db.Preload("Members").First(&chain, id).Error
	return &chain, err
}

func (r *Repository) GetAll() ([]PrayerChain, error) {
	var chains []PrayerChain
	err := r.db.Preload("Members").Order("created_at DESC").Find(&chains).Error
	return chains, err
}

func (r *Repository) GetByUserID(userID uint) ([]PrayerChain, error) {
	var chains []PrayerChain
	err := r.db.Preload("Members").
		Joins("JOIN chain_members ON chain_members.chain_id = prayer_chains.id").
		Where("chain_members.user_id = ?", userID).
		Order("prayer_chains.created_at DESC").
		Find(&chains).Error
	return chains, err
}

func (r *Repository) Update(chain *PrayerChain) error {
	return r.db.Save(chain).Error
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&PrayerChain{}, id).Error
}

// Chain Member methods
func (r *Repository) AddMember(member *ChainMember) error {
	return r.db.Create(member).Error
}

func (r *Repository) GetMember(chainID, userID uint) (*ChainMember, error) {
	var member ChainMember
	err := r.db.Where("chain_id = ? AND user_id = ?", chainID, userID).First(&member).Error
	return &member, err
}

func (r *Repository) GetMembersByChainID(chainID uint) ([]ChainMember, error) {
	var members []ChainMember
	err := r.db.Where("chain_id = ?", chainID).Find(&members).Error
	return members, err
}

func (r *Repository) RemoveMember(chainID, userID uint) error {
	return r.db.Where("chain_id = ? AND user_id = ?", chainID, userID).Delete(&ChainMember{}).Error
}

func (r *Repository) IsMember(chainID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&ChainMember{}).
		Where("chain_id = ? AND user_id = ?", chainID, userID).
		Count(&count).Error
	return count > 0, err
}

// Prayer Commitment methods
func (r *Repository) CreateCommitment(commitment *PrayerCommitment) error {
	return r.db.Create(commitment).Error
}

func (r *Repository) GetCommitmentsByMemberID(memberID uint) ([]PrayerCommitment, error) {
	var commitments []PrayerCommitment
	err := r.db.Where("member_id = ?", memberID).Find(&commitments).Error
	return commitments, err
}

func (r *Repository) GetCommitmentsByChainID(chainID uint) ([]PrayerCommitment, error) {
	var commitments []PrayerCommitment
	err := r.db.Where("chain_id = ?", chainID).Find(&commitments).Error
	return commitments, err
}

func (r *Repository) DeleteCommitment(chainID, memberID, prayForUserID uint) error {
	return r.db.Where("chain_id = ? AND member_id = ? AND pray_for_user_id = ?", 
		chainID, memberID, prayForUserID).Delete(&PrayerCommitment{}).Error
}

func (r *Repository) HasCommitment(chainID, memberID, prayForUserID uint) (bool, error) {
	var count int64
	err := r.db.Model(&PrayerCommitment{}).
		Where("chain_id = ? AND member_id = ? AND pray_for_user_id = ?", 
			chainID, memberID, prayForUserID).
		Count(&count).Error
	return count > 0, err
}






