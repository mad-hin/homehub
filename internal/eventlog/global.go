package eventlog

import "sync"

var (
	globalMu sync.Mutex
	global   *Logger
)

// SetGlobal installs the process-wide logger used by Log()/Error().
func SetGlobal(l *Logger) {
	globalMu.Lock()
	defer globalMu.Unlock()
	global = l
}

// Log writes an informational event to the global logger (no-op if unset).
func Log(kind, message string) {
	globalMu.Lock()
	defer globalMu.Unlock()
	if global != nil {
		global.Log(kind, message)
	}
}

// Error logs an operation failure with context. Convenience wrapper.
func Error(context string, err error) {
	if err != nil {
		Log("error", context+": "+err.Error())
	}
}
