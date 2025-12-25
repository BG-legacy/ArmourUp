// Package database provides database connection and configuration functionality for the ArmourUp API.
package database

// This file is used to connect to the database
import (
	"fmt"
	"log"
	"os"
	"time"

	"armourup/internal/domain/encouragement"
	"armourup/internal/domain/gratitude"
	"armourup/internal/domain/insights"
	"armourup/internal/domain/journal"
	"armourup/internal/domain/mood"
	"armourup/internal/domain/prayer"
	"armourup/internal/domain/prayerchain"
	"armourup/internal/domain/user"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global database connection instance.
var DB *gorm.DB

// Config holds the database connection configuration parameters.
type Config struct {
	Host     string // Database host address
	Port     string // Database port number
	User     string // Database username
	Password string // Database password
	DBName   string // Database name
	SSLMode  string // SSL mode for the connection
}

// NewConfig creates a new database configuration using values from environment variables.
func NewConfig() *Config {
	return &Config{
		Host:     os.Getenv("ARMOURUP_DATABASE_HOST"),
		Port:     os.Getenv("ARMOURUP_DATABASE_PORT"),
		User:     os.Getenv("ARMOURUP_DATABASE_USER"),
		Password: os.Getenv("ARMOURUP_DATABASE_PASSWORD"),
		DBName:   os.Getenv("ARMOURUP_DATABASE_DBNAME"),
		SSLMode:  getSSLMode(),
	}
}

// getSSLMode determines the appropriate SSL mode for the database connection.
// For Supabase and other cloud providers, SSL is required.
func getSSLMode() string {
	sslMode := os.Getenv("ARMOURUP_DATABASE_SSLMODE")
	if sslMode == "" {
		// Default to require for cloud databases like Supabase
		return "require"
	}
	return sslMode
}

// DSN returns the Data Source Name (connection string) for the database.
// The string is formatted according to PostgreSQL's connection string format.
// If DATABASE_URL is set, it uses that directly (for Supabase compatibility).
func (c *Config) DSN() string {
	// Check if DATABASE_URL is provided (common for Supabase and other cloud providers)
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		log.Println("Using DATABASE_URL for connection")
		return databaseURL
	}
	
	// Otherwise, construct DSN from individual components
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// InitDB initializes the database connection and configures connection pooling.
// It performs the following operations:
// 1. Creates a new database configuration
// 2. Sets up GORM logger with appropriate settings
// 3. Establishes the database connection
// 4. Configures connection pooling parameters
// 5. Tests the connection
// Returns the configured GORM database instance or an error if initialization fails.
func InitDB() (*gorm.DB, error) {
	config := NewConfig()

	// Configure GORM logger
	newLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Open database connection
	db, err := gorm.Open(postgres.Open(config.DSN()), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying SQL DB for connection pooling
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)           // Maximum number of idle connections
	sqlDB.SetMaxOpenConns(100)          // Maximum number of open connections
	sqlDB.SetConnMaxLifetime(time.Hour) // Maximum lifetime of a connection

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	DB = db
	return db, nil
}

// AutoMigrate automatically creates or updates database tables based on the provided models.
// It handles the following models:
// - User
// - Encouragement
// - JournalEntry
// - PrayerRequest
// - PrayerLog
// - PrayerChain
// - ChainMember
// - PrayerCommitment
// - MoodEntry
// - GratitudeEntry
// - ProgressInsight
// Returns an error if migration fails.
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&user.User{},
		&encouragement.Encouragement{},
		&journal.JournalEntry{},
		&prayer.PrayerRequest{},
		&prayer.PrayerLog{},
		&prayerchain.PrayerChain{},
		&prayerchain.ChainMember{},
		&prayerchain.PrayerCommitment{},
		&mood.MoodEntry{},
		&gratitude.GratitudeEntry{},
		&insights.ProgressInsight{},
	)
}
