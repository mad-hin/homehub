package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"homehub/internal"
)

func main() {
	port := flag.String("port", "8080", "HTTP port to listen on")
	configPath := flag.String("config", "config.json", "path to config.json")
	checkInterval := flag.Duration("interval", 60*time.Second, "health check interval")
	flag.Parse()

	cfg, err := internal.LoadConfig(*configPath)
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}
	log.Printf("loaded config from %s (%d categories, %d bookmark groups)",
		*configPath, len(cfg.Categories), len(cfg.Bookmarks))

	checker := internal.NewChecker(*checkInterval)
	checker.Start(func() []string { return cfg.AllAppURLs() })

	srv := internal.NewServer(cfg, checker, staticFS())

	httpServer := &http.Server{
		Addr:         ":" + *port,
		Handler:      srv.Handler(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("listening on http://0.0.0.0:%s", *port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}
	log.Println("stopped")
}
