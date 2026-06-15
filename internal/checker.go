package internal

import (
	"net/http"
	"sync"
	"time"
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
}

func NewChecker(interval time.Duration) *Checker {
	return &Checker{
		results: make(map[string]*AppStatus),
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		interval: interval,
	}
}

func (ch *Checker) Start(getURLs func() []string) {
	go func() {
		ch.checkAll(getURLs())

		ticker := time.NewTicker(ch.interval)
		defer ticker.Stop()
		for range ticker.C {
			ch.checkAll(getURLs())
		}
	}()
}

func (ch *Checker) checkAll(urls []string) {
	var wg sync.WaitGroup
	for _, url := range urls {
		wg.Add(1)
		go func(u string) {
			defer wg.Done()
			ch.checkOne(u)
		}(url)
	}
	wg.Wait()
}

func (ch *Checker) checkOne(url string) {
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

	ch.mu.Lock()
	ch.results[url] = status
	ch.mu.Unlock()
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
