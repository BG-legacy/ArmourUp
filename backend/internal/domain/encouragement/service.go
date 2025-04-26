package encouragement

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateEncouragement(encouragement *Encouragement) error {
	return s.repo.Create(encouragement)
}

func (s *Service) GetEncouragement(id uint) (*Encouragement, error) {
	return s.repo.GetByID(id)
}

func (s *Service) GetEncouragements() ([]Encouragement, error) {
	return s.repo.GetAll()
}

func (s *Service) UpdateEncouragement(encouragement *Encouragement) error {
	return s.repo.Update(encouragement)
}

func (s *Service) DeleteEncouragement(id uint) error {
	return s.repo.Delete(id)
} 