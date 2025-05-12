package testutils

import (
	"armourup/internal/config"
	"armourup/internal/database"
	"os"
	"path/filepath"
	"testing"

	"gorm.io/gorm"
)

// SetupTestDB creates a test database connection and runs migrations
func SetupTestDB(t *testing.T) *gorm.DB {
	// Set test environment and config path
	os.Setenv("ENV", "test")
	configPath, _ := filepath.Abs("../../config/test_config.yaml")
	os.Setenv("CONFIG_PATH", configPath)

	// Load test config
	if err := config.LoadConfig(); err != nil {
		t.Fatalf("Failed to load test config: %v", err)
	}

	// Initialize test database
	db, err := database.InitDB()
	if err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}

	// Run migrations
	if err := database.AutoMigrate(db); err != nil {
		t.Fatalf("Failed to run migrations: %v", err)
	}

	return db
}

// TeardownTestDB cleans up the test database
func TeardownTestDB(t *testing.T, db *gorm.DB) {
	// Drop all tables
	if err := db.Migrator().DropTable("users", "journals", "encouragements"); err != nil {
		t.Fatalf("Failed to drop tables: %v", err)
	}

	// Close database connection
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Failed to get database connection: %v", err)
	}
	sqlDB.Close()
}
