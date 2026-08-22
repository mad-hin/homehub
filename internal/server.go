package internal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"homehub/internal/eventlog"
)

type Server struct {
	config   *Config
	checker  *Checker
	broker   *Broker
	mux      *http.ServeMux
	lastConf []byte // JSON snapshot of last published config, for change detection
	lastMu   sync.RWMutex
}

func NewServer(cfg *Config, checker *Checker, staticFS http.FileSystem) *Server {
	s := &Server{
		config:  cfg,
		checker: checker,
		broker:  NewBroker(),
		mux:     http.NewServeMux(),
	}

	s.mux.HandleFunc("/api/config", s.handleConfig)
	s.mux.HandleFunc("/api/status", s.handleStatus)
	s.mux.HandleFunc("/api/events", s.handleEvents)
	s.mux.Handle("/", http.FileServer(staticFS))

	return s
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

// SetChecker allows swapping the checker used by /api/status and the SSE
// baseline snapshot. Needed because the checker is created after the server
// in main (so its onChange hook can broadcast via the broker).
func (s *Server) SetChecker(c *Checker) {
	s.lastMu.Lock()
	defer s.lastMu.Unlock()
	s.checker = c
}

// BroadcastStatus publishes a "status" SSE event to all subscribers with the
// given results snapshot.
func (s *Server) BroadcastStatus(results map[string]*AppStatus) {
	s.broker.Publish(Event{Name: "status", Data: s.json(results)})
}

// WatchForChanges polls the config file and publishes an SSE event whenever
// either the config document or health-check results differ from the last
// published snapshot. Two event kinds are emitted: "config" and "status".
func (s *Server) WatchForChanges(configInterval time.Duration) {
	// Status changes are pushed by the checker's onChange hook. Config changes
	// are discovered by polling here (typically tied to the same tick).
	ticker := time.NewTicker(configInterval)
	defer ticker.Stop()
	for range ticker.C {
		s.publishConfigIfChanged()
	}
}

// publishConfigIfChanged reloads from disk and, if the serialized config
// differs from the last published snapshot, broadcasts a "config" event.
// Returns the current serialized snapshot regardless.
func (s *Server) publishConfigIfChanged() {
	if err := s.config.Reload(); err != nil {
		log.Printf("config reload error: %v", err)
		// Config.Reload already logged the failure with context.
	}

	snapshot := s.config.Snapshot()
	data, err := json.Marshal(snapshot)
	if err != nil {
		eventlog.Error("config marshal", err)
		return
	}

	s.lastMu.Lock()
	defer s.lastMu.Unlock()

	if !bytes.Equal(s.lastConf, data) {
		s.lastConf = data
		s.broker.Publish(Event{Name: "config", Data: data})
	}
}

// initialSnapshot publishes the initial config snapshot so late subscribers
// have a baseline to compare future diffs against.
func (s *Server) initialSnapshot() {
	s.publishConfigIfChanged()
}

// handleEvents streams SSE of config and status changes. Subscribers get an
// initial full-snapshot for both, then subsequent events only when the
// serialized document differs from what was already published.
func (s *Server) handleEvents(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	ch := s.broker.Subscribe()
	defer s.broker.Unsubscribe(ch)

	// Send current snapshots so a late subscriber has a baseline.
	s.sendEvent(w, flusher, Event{Name: "config", Data: s.json(s.configSnapshot())})
	s.sendEvent(w, flusher, Event{Name: "status", Data: s.json(s.checker.Results())})

	for {
		select {
		case ev := <-ch:
			if !s.sendEvent(w, flusher, ev) {
				return
			}
		case <-r.Context().Done():
			return
		}
	}
}

// sendEvent writes one SSE frame; returns false if the client disconnected.
func (s *Server) sendEvent(w http.ResponseWriter, flusher http.Flusher, ev Event) bool {
	if _, err := fmt.Fprintf(w, "event: %s\n", ev.Name); err != nil {
		return false
	}
	if _, err := fmt.Fprintf(w, "data: %s\n\n", ev.Data); err != nil {
		return false
	}
	flusher.Flush()
	return true
}

// configSnapshot returns the current config snapshot.
func (s *Server) configSnapshot() *Config {
	return s.config.Snapshot()
}

// json marshals v; on error it returns null. Callers treat an error as
// sufficient-to-send-empty, which the frontend handles gracefully.
func (s *Server) json(v any) []byte {
	data, err := json.Marshal(v)
	if err != nil {
		eventlog.Error("json marshal", err)
		return []byte("null")
	}
	return data
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
