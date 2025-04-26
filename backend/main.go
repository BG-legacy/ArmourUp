package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"armourup/internal/config"
	"armourup/internal/database"
	"armourup/internal/server"
)

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// Run migrations if in development
	if os.Getenv("ENV") == "development" {
		if err := database.AutoMigrate(db); err != nil {
			log.Fatalf("Error running migrations: %v", err)
		}
	}

	// Create router
	router := gin.Default()

	// Initialize server
	srv := server.NewServer(router, db)

	// Start server
	port := viper.GetString("server.port")
	if port == "" {
		port = "8080"
	}

	if err := srv.Start(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
} 