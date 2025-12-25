package prayerchain

import (
	"errors"
	"armourup/internal/domain/user"
)

type Service struct {
	repo     *Repository
	userRepo user.Repository
}

func NewService(repo *Repository, userRepo user.Repository) *Service {
	return &Service{
		repo:     repo,
		userRepo: userRepo,
	}
}

func (s *Service) CreatePrayerChain(userID uint, dto *CreatePrayerChainDTO) (*PrayerChain, error) {
	chain := &PrayerChain{
		Name:            dto.Name,
		Description:     dto.Description,
		CreatedByUserID: userID,
	}

	if err := s.repo.Create(chain); err != nil {
		return nil, err
	}

	// Add creator as first member
	member := &ChainMember{
		ChainID: chain.ID,
		UserID:  userID,
	}
	if err := s.repo.AddMember(member); err != nil {
		return nil, err
	}

	return chain, nil
}

func (s *Service) GetPrayerChain(id uint) (*PrayerChain, error) {
	return s.repo.GetByID(id)
}

func (s *Service) GetAllPrayerChains() ([]PrayerChain, error) {
	return s.repo.GetAll()
}

func (s *Service) GetUserPrayerChains(userID uint) ([]PrayerChain, error) {
	return s.repo.GetByUserID(userID)
}

func (s *Service) UpdatePrayerChain(chain *PrayerChain) error {
	return s.repo.Update(chain)
}

func (s *Service) DeletePrayerChain(id uint) error {
	return s.repo.Delete(id)
}

func (s *Service) JoinChain(userID uint, chainID uint) error {
	// Check if chain exists
	chain, err := s.repo.GetByID(chainID)
	if err != nil {
		return errors.New("prayer chain not found")
	}

	// Check if already a member
	isMember, err := s.repo.IsMember(chainID, userID)
	if err != nil {
		return err
	}
	if isMember {
		return errors.New("already a member of this prayer chain")
	}

	// Add member
	member := &ChainMember{
		ChainID: chain.ID,
		UserID:  userID,
	}
	return s.repo.AddMember(member)
}

func (s *Service) LeaveChain(userID uint, chainID uint) error {
	// Check if chain exists
	_, err := s.repo.GetByID(chainID)
	if err != nil {
		return errors.New("prayer chain not found")
	}

	// Check if member
	isMember, err := s.repo.IsMember(chainID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("not a member of this prayer chain")
	}

	return s.repo.RemoveMember(chainID, userID)
}

func (s *Service) CommitToPray(userID uint, dto *CommitToPrayDTO) error {
	// Check if chain exists
	chain, err := s.repo.GetByID(dto.ChainID)
	if err != nil {
		return errors.New("prayer chain not found")
	}

	// Check if user is a member
	isMember, err := s.repo.IsMember(dto.ChainID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("must be a member of the prayer chain to commit")
	}

	// Get member record
	member, err := s.repo.GetMember(dto.ChainID, userID)
	if err != nil {
		return errors.New("member record not found")
	}

	// Check if user is trying to commit to pray for themselves
	if userID == dto.PrayForUserID {
		return errors.New("cannot commit to pray for yourself")
	}

	// Check if target user is also a member
	isTargetMember, err := s.repo.IsMember(dto.ChainID, dto.PrayForUserID)
	if err != nil {
		return err
	}
	if !isTargetMember {
		return errors.New("can only commit to pray for members of the same chain")
	}

	// Check if commitment already exists
	hasCommitment, err := s.repo.HasCommitment(dto.ChainID, member.ID, dto.PrayForUserID)
	if err != nil {
		return err
	}
	if hasCommitment {
		return errors.New("already committed to pray for this member")
	}

	// Create commitment
	commitment := &PrayerCommitment{
		ChainID:       chain.ID,
		MemberID:      member.ID,
		PrayForUserID: dto.PrayForUserID,
	}
	return s.repo.CreateCommitment(commitment)
}

func (s *Service) RemoveCommitment(userID uint, chainID uint, prayForUserID uint) error {
	// Get member record
	member, err := s.repo.GetMember(chainID, userID)
	if err != nil {
		return errors.New("member record not found")
	}

	return s.repo.DeleteCommitment(chainID, member.ID, prayForUserID)
}

func (s *Service) GetChainWithDetails(chainID uint) (*PrayerChainResponse, error) {
	chain, err := s.repo.GetByID(chainID)
	if err != nil {
		return nil, err
	}

	// Get creator info
	creator, err := s.userRepo.FindByID(chain.CreatedByUserID)
	if err == nil {
		chain.CreatedBy = creator
	}

	// Get members with user info
	members, err := s.repo.GetMembersByChainID(chainID)
	if err != nil {
		return nil, err
	}

	memberResponses := make([]ChainMemberResponse, len(members))
	for i, member := range members {
		// Get user info
		user, err := s.userRepo.FindByID(member.UserID)
		if err == nil {
			member.User = user
		}

		// Get commitments for this member
		commitments, _ := s.repo.GetCommitmentsByMemberID(member.ID)
		commitmentResponses := make([]PrayerCommitmentResponse, len(commitments))
		for j, commitment := range commitments {
			prayForUser, _ := s.userRepo.FindByID(commitment.PrayForUserID)
			commitmentResponses[j] = PrayerCommitmentResponse{
				ID:            commitment.ID,
				ChainID:       commitment.ChainID,
				MemberID:      commitment.MemberID,
				PrayForUserID: commitment.PrayForUserID,
				CreatedAt:     commitment.CreatedAt,
				PrayForUser:   prayForUser,
			}
		}

		memberResponses[i] = ChainMemberResponse{
			ID:                member.ID,
			ChainID:           member.ChainID,
			UserID:            member.UserID,
			CreatedAt:         member.CreatedAt,
			User:              user,
			PrayerCommitments: commitmentResponses,
		}
	}

	return &PrayerChainResponse{
		ID:              chain.ID,
		Name:            chain.Name,
		Description:     chain.Description,
		CreatedByUserID: chain.CreatedByUserID,
		CreatedAt:       chain.CreatedAt,
		UpdatedAt:       chain.UpdatedAt,
		Members:         memberResponses,
		CreatedBy:       creator,
	}, nil
}

