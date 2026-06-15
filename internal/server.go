package internal

import (
	"encoding/json"
	"log"
	"net/http"
)

type Server struct {
	config  *Config
	checker *Checker
	mux     *http.ServeMux
}

func NewServer(cfg *Config, checker *Checker, staticFS http.FileSystem) *Server {
	s := &Server{
		config:  cfg,
		checker: checker,
		mux:     http.NewServeMux(),
	}

	s.mux.HandleFunc("/api/config", s.handleConfig)
	s.mux.HandleFunc("/api/status", s.handleStatus)
	s.mux.Handle("/", http.FileServer(staticFS))

	return s
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

func (s *Server) handleConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Reload from disk on every request so config.json edits take effect immediately.
	s.config.Reload()

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")

	snapshot := s.config.Snapshot()
	if err := json.NewEncoder(w).Encode(snapshot); err != nil {
		log.Printf("error encoding config: %v", err)
	}
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")

	results := s.checker.Results()
	if err := json.NewEncoder(w).Encode(results); err != nil {
		log.Printf("error encoding status: %v", err)
	}
}
