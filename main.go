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
	"homehub/internal/eventlog"
)

func main() {
	port := flag.String("port", "8080", "HTTP port to listen on")
	configPath := flag.String("config", "config.json", "path to config.json")
	checkInterval := flag.Duration("interval", 60*time.Second, "health check interval")
	logDir := flag.String("logdir", "logs", "directory for daily event logs")
	flag.Parse()

	el, err := eventlog.New(*logDir)
	if err != nil {
		log.Fatalf("failed to initialize event logger: %v", err)
	}
	eventlog.SetGlobal(el)
	defer el.Close()

	cfg, err := internal.LoadConfig(*configPath)
	if err != nil {
		eventlog.Error("config load "+*configPath, err)
		log.Fatalf("failed to load config: %v", err)
	}
	eventlog.Log("startup", "loaded config "+*configPath)

	srv := internal.NewServer(cfg, nil, staticFS())

	checker := internal.NewChecker(*checkInterval, func(results map[string]*internal.AppStatus) {
		srv.BroadcastStatus(results)
	})
	checker.Start(func() []string { return cfg.AllAppURLs() })

	srv.SetChecker(checker)
	go srv.WatchForChanges(3 * time.Second)

	httpServer := &http.Server{
		Addr:         ":" + *port,
		Handler:      srv.Handler(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		eventlog.Log("startup", "listening on http://0.0.0.0:"+*port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			eventlog.Error("server listen", err)
			log.Fatalf("server error: %v", err)
		}
	}()

	eventlog.Log("startup", "homehub running")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	eventlog.Log("shutdown", "signal received")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		eventlog.Error("server shutdown", err)
		log.Fatalf("forced shutdown: %v", err)
	}
	log.Println("stopped")
}
