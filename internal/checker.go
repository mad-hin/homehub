package internal

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"homehub/internal/eventlog"
)

type AppStatus struct {
	URL        string `json:"url"`
	Online     bool   `json:"online"`
	StatusCode int    `json:"statusCode"`
	LatencyMs  int64  `json:"latencyMs"`
	CheckedAt  string `json:"checkedAt"`
	Error      string `json:"error,omitempty"`
}

type Checker struct {
	mu       sync.RWMutex
	results  map[string]*AppStatus
	client   *http.Client
	interval time.Duration
	onChange func(map[string]*AppStatus)
}

func NewChecker(interval time.Duration, onChange func(map[string]*AppStatus)) *Checker {
	return &Checker{
		results: make(map[string]*AppStatus),
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		interval: interval,
		onChange: onChange,
	}
}

func (ch *Checker) Start(getURLs func() []string) {
	go func() {
		if changed := ch.checkAll(getURLs()); changed && ch.onChange != nil {
			ch.onChange(ch.Results())
		}

		ticker := time.NewTicker(ch.interval)
		defer ticker.Stop()
		for range ticker.C {
			if changed := ch.checkAll(getURLs()); changed && ch.onChange != nil {
				ch.onChange(ch.Results())
			}
		}
	}()
}

// checkAll probes all URLs concurrently and reports whether any tracked
// status meaningfully changed (online/offline flips, status-code changes,
// added or removed URLs). Returns true if the stored snapshot differs.
func (ch *Checker) checkAll(urls []string) bool {
	var wg sync.WaitGroup
	probes := make([]*AppStatus, len(urls))
	for i, url := range urls {
		wg.Add(1)
		go func(i int, u string) {
			defer wg.Done()
			probes[i] = ch.checkOne(u)
		}(i, url)
	}
	wg.Wait()

	ch.mu.Lock()
	defer ch.mu.Unlock()

	changed := len(urls) != len(ch.results)
	for _, s := range probes {
		prev, ok := ch.results[s.URL]
		if !ok ||
			prev.Online != s.Online ||
			prev.StatusCode != s.StatusCode ||
			prev.Error != s.Error {
			changed = true
		}

		// Log every probe result (online or offline) with last known state.
		if s.Online {
			eventlog.Log("check", "up "+s.URL+" status="+itoa(s.StatusCode)+" latency="+i64(s.LatencyMs)+"ms")
		} else {
			eventlog.Log("check", "down "+s.URL+" status="+itoa(s.StatusCode)+" err="+s.Error)
		}
	}

	if changed {
		ch.results = make(map[string]*AppStatus, len(probes))
		for _, s := range probes {
			ch.results[s.URL] = s
		}
	}

	return changed
}

// itoa / i64 keep event-log formatting concise.
func itoa(n int) string  { return strconv.Itoa(n) }
func i64(n int64) string { return strconv.FormatInt(n, 10) }

// checkOne performs a single HEAD probe and returns the resulting status.
func (ch *Checker) checkOne(url string) *AppStatus {
	start := time.Now()
	resp, err := ch.client.Head(url)
	latency := time.Since(start).Milliseconds()

	status := &AppStatus{
		URL:       url,
		LatencyMs: latency,
		CheckedAt: time.Now().UTC().Format(time.RFC3339),
	}

	if err != nil {
		status.Online = false
		status.Error = err.Error()
	} else {
		resp.Body.Close()
		status.StatusCode = resp.StatusCode
		status.Online = resp.StatusCode >= 200 && resp.StatusCode < 400
	}

	return status
}

func (ch *Checker) Results() map[string]*AppStatus {
	ch.mu.RLock()
	defer ch.mu.RUnlock()

	out := make(map[string]*AppStatus, len(ch.results))
	for k, v := range ch.results {
		out[k] = v
	}
	return out
}
