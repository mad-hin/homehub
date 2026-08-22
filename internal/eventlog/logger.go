// Package eventlog provides a simple, process-local event logger that
// writes to dated files (eventlog.yyyymmdd) in a configurable directory.
// It rotates at local midnight, retains the last 7 days of logs, and
// deletes older files. It is not exposed via HTTP — server-side only.
package eventlog

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const retentionDays = 7

// Logger writes timestamped events to a per-day file. Safe for concurrent
// use. Dates are computed in the server machine's local timezone.
type Logger struct {
	mu   sync.Mutex
	dir  string
	file *os.File
	day  string // current YYYYMMDD
}

// New creates a logger that will write into dir, creating it if needed.
func New(dir string) (*Logger, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	l := &Logger{dir: dir}
	if err := l.rotateLocked(); err != nil {
		return nil, err
	}
	l.prune()
	return l, nil
}

// Log appends one event line to today's file, rotating if the date rolled.
func (l *Logger) Log(kind, message string) {
	l.mu.Lock()
	defer l.mu.Unlock()

	today := time.Now().Format("20060102")
	if today != l.day {
		if err := l.rotateLocked(); err != nil {
			fmt.Fprintf(os.Stderr, "eventlog rotate failed: %v\n", err)
			return
		}
		l.prune()
	}

	ts := time.Now().Format("2006-01-02 15:04:05")
	fmt.Fprintf(l.file, "%s [%s] %s\n", ts, kind, message)
}

// rotateLocked closes the current file and opens today's (caller holds mu).
func (l *Logger) rotateLocked() error {
	if l.file != nil {
		l.file.Close()
	}
	l.day = time.Now().Format("20060102")
	name := fmt.Sprintf("eventlog.%s", l.day)
	f, err := os.OpenFile(filepath.Join(l.dir, name), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	l.file = f
	return nil
}

// prune deletes eventlog.* files older than retentionDays, using the date
// encoded in the filename rather than the file mtime (survives restarts).
func (l *Logger) prune() {
	entries, err := os.ReadDir(l.dir)
	if err != nil {
		return
	}
	cutoff := time.Now().AddDate(0, 0, -retentionDays)
	for _, e := range entries {
		if e.IsDir() || !strings.HasPrefix(e.Name(), "eventlog.") {
			continue
		}
		dateStr := strings.TrimPrefix(e.Name(), "eventlog.")
		if len(dateStr) != 8 {
			continue
		}
		t, err := time.Parse("20060102", dateStr)
		if err != nil || !t.Before(cutoff) {
			continue
		}
		os.Remove(filepath.Join(l.dir, e.Name()))
	}
}

// Close closes the current day file.
func (l *Logger) Close() {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.file != nil {
		l.file.Close()
		l.file = nil
	}
}
