package test

import (
	"os"
	"testing"

	"github.com/spf13/viper"
)

func SetupTestConfig(t *testing.T) {
	// Set test environment
	os.Setenv("ENV", "test")
	
	// Set test database configuration
	viper.Set("database.host", "localhost")
	viper.Set("database.port", "5432")
	viper.Set("database.user", "postgres")
	viper.Set("database.password", "postgres")
	viper.Set("database.dbname", "armourup_test")
	viper.Set("database.sslmode", "disable")
	
	// Set server configuration
	viper.Set("server.port", "8081")
}

func TeardownTestConfig(t *testing.T) {
	// Clean up environment variables
	os.Unsetenv("ENV")
} 