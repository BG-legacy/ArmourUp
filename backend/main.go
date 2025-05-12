// Package main is the entry point for the ArmourUp backend service.
// It handles server initialization, configuration loading, and dependency setup.
package main

import (
	"os"
	"runtime/debug"

	"armourup/internal/config"
	"armourup/internal/database"
	"armourup/internal/middleware"
	"armourup/internal/server"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// logger is a global instance of the structured logger
var logger *zap.Logger

// initLogger initializes the structured logger with production configuration.
// It sets up ISO8601 time encoding and capital level encoding for better readability.
// Returns an error if logger initialization fails.
func initLogger() error {
	config := zap.NewProductionConfig()
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	config.EncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}

	var err error
	logger, err = config.Build()
	if err != nil {
		return err
	}
	return nil
}

// recoveryMiddleware is a Gin middleware that recovers from panics and logs the error details.
// It ensures that the server doesn't crash on unexpected errors and provides meaningful error responses.
func recoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
					zap.String("stack", string(debug.Stack())),
				)
				c.JSON(500, gin.H{
					"error":   "Internal server error",
					"message": "Something went wrong. Please try again later.",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

// main is the entry point of the application.
// It performs the following operations:
// 1. Initializes the structured logger
// 2. Loads application configuration
// 3. Initializes the database connection
// 4. Runs database migrations if enabled
// 5. Sets up the HTTP router with middleware
// 6. Starts the HTTP server
func main() {
	// Initialize logger
	if err := initLogger(); err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync()

	// Load configuration
	if err := config.LoadConfig(); err != nil {
		logger.Fatal("Error loading config", zap.Error(err))
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		logger.Fatal("Error initializing database", zap.Error(err))
	}

	// Run migrations if enabled
	if os.Getenv("RUN_MIGRATIONS") == "true" {
		logger.Info("Running database migrations")
		if err := database.AutoMigrate(db); err != nil {
			logger.Fatal("Error running migrations", zap.Error(err))
		}
		logger.Info("Database migrations completed successfully")
	}

	// Create router
	router := gin.Default()

	// Apply middleware
	router.Use(recoveryMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.RequestLogger())
	router.Use(middleware.InputValidator())

	// Initialize server
	srv := server.NewServer(router, db)

	// Start server
	port := viper.GetString("server.port")
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting server", zap.String("port", port))
	if err := srv.Start(":" + port); err != nil {
		logger.Fatal("Error starting server", zap.Error(err))
	}
}
