// Package config provides configuration management functionality for the ArmourUp API.
// It handles loading and managing configuration from various sources including environment variables,
// .env files, and YAML configuration files.
package config

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config represents the complete application configuration structure.
// It contains all configuration sections needed by the application.
type Config struct {
	Server   ServerConfig   // Server-related configuration
	Database DatabaseConfig // Database connection configuration
	JWT      JWTConfig      // JWT authentication configuration
	OpenAI   OpenAIConfig   // OpenAI API configuration
}

// ServerConfig holds configuration parameters for the HTTP server.
type ServerConfig struct {
	Port string // Port number for the server to listen on
}

// DatabaseConfig holds configuration parameters for the database connection.
type DatabaseConfig struct {
	Host     string // Database host address
	Port     string // Database port number
	User     string // Database username
	Password string // Database password
	DBName   string // Database name
}

// JWTConfig holds configuration parameters for JWT token generation and validation.
type JWTConfig struct {
	Secret string // Secret key used for signing JWT tokens
}

// OpenAIConfig holds configuration parameters for OpenAI API integration.
type OpenAIConfig struct {
	APIKey string // OpenAI API key for authentication
}

// LoadConfig initializes and loads the application configuration from multiple sources.
// It performs the following operations in order:
// 1. Attempts to load environment variables from .env file
// 2. Sets up Viper for configuration management
// 3. Configures environment variable prefix
// 4. Sets up configuration file search paths
// 5. Sets default values for required configuration
// 6. Attempts to read configuration from YAML file
//
// Returns an error if configuration loading fails, except for missing .env file
// which is considered optional.
func LoadConfig() error {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		// It's okay if .env file doesn't exist
	}

	// Load environment variables
	viper.AutomaticEnv()
	viper.SetEnvPrefix("ARMOURUP")

	// Set config file settings
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")

	// Set default values
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", "5432")
	viper.SetDefault("jwt.secret", "your-secret-key") // Default fallback

	// Bind environment variables
	// Viper will automatically map ARMOURUP_JWT_SECRET to jwt.secret
	viper.BindEnv("jwt.secret", "ARMOURUP_JWT_SECRET")

	// Read config file
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found; ignore error if we have defaults
			return nil
		}
		return err
	}

	return nil
}

// GetOpenAIAPIKey retrieves the OpenAI API key from environment variables.
// This key is required for making requests to the OpenAI API.
func GetOpenAIAPIKey() string {
	return os.Getenv("OPENAI_API_KEY")
}
