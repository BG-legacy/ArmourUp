package journal

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateEntry(entry *JournalEntry) error {
	return s.repo.Create(entry)
}

func (s *Service) GetEntry(id uint) (*JournalEntry, error) {
	return s.repo.GetByID(id)
}

func (s *Service) GetEntries() ([]JournalEntry, error) {
	return s.repo.GetAll()
}

func (s *Service) UpdateEntry(entry *JournalEntry) error {
	return s.repo.Update(entry)
}

func (s *Service) DeleteEntry(id uint) error {
	return s.repo.Delete(id)
} 