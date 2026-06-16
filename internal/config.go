package internal

import (
	"encoding/json"
	"os"
	"sync"
	"time"
)

type App struct {
	Name  string `json:"name"`
	URL   string `json:"url"`
	Icon  string `json:"icon"`
	Label string `json:"label"`
}

type Category struct {
	Name  string `json:"name"`
	Label string `json:"label"`
	Apps  []App  `json:"apps"`
}

type SearchEngine struct {
	Name   string `json:"name"`
	URL    string `json:"url"`
	Prefix string `json:"prefix"`
}

type Search struct {
	Engines []SearchEngine `json:"engines"`
}

type BookmarkLink struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

type BookmarkGroup struct {
	Name  string         `json:"name"`
	Label string         `json:"label"`
	Links []BookmarkLink `json:"links"`
}

type Theme struct {
	Surface            string `json:"surface"`
	SurfaceContainerLow string `json:"surfaceContainerLow"`
	OnSurface          string `json:"onSurface"`
	OnSurfaceVariant   string `json:"onSurfaceVariant"`
	Outline            string `json:"outline"`
	OutlineVariant     string `json:"outlineVariant"`
	Primary            string `json:"primary"`
	PrimaryContainer   string `json:"primaryContainer"`
	OnPrimary          string `json:"onPrimary"`
	Background         string `json:"background"`
}

type Config struct {
	Greeting   string          `json:"greeting"`
	Search     Search          `json:"search"`
	Categories []Category      `json:"categories"`
	Bookmarks  []BookmarkGroup `json:"bookmarks"`
	Theme      Theme           `json:"theme"`

	mu      sync.RWMutex
	path    string
	modTime time.Time
}

func LoadConfig(path string) (*Config, error) {
	cfg := &Config{
		Greeting: "Good afternoon, User.",
		Search: Search{
			Engines: []SearchEngine{
				{Name: "DuckDuckGo", URL: "https://duckduckgo.com/?q=", Prefix: "/d"},
				{Name: "Google", URL: "https://www.google.com/search?q=", Prefix: "/g"},
			},
		},
		Theme: Theme{
			Surface:             "#fcf9f8",
			SurfaceContainerLow: "#f0eded",
			OnSurface:           "#1b1c1c",
			OnSurfaceVariant:    "#58413d",
			Outline:             "#8b716b",
			OutlineVariant:      "#dfc0b9",
			Primary:             "#a83820",
			PrimaryContainer:    "#ff7759",
			OnPrimary:           "#ffffff",
			Background:          "#fcf9f8",
		},
	}
	cfg.path = path

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, nil
		}
		return nil, err
	}

	if err := json.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	if info, err := os.Stat(path); err == nil {
		cfg.modTime = info.ModTime()
	}

	return cfg, nil
}

func (c *Config) Reload() error {
	info, err := os.Stat(c.path)
	if err != nil {
		return err
	}
	if !info.ModTime().After(c.modTime) {
		return nil // unchanged
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	data, err := os.ReadFile(c.path)
	if err != nil {
		return err
	}

	var fresh Config
	if err := json.Unmarshal(data, &fresh); err != nil {
		return err
	}

	c.Greeting = fresh.Greeting
	c.Search = fresh.Search
	c.Categories = fresh.Categories
	c.Bookmarks = fresh.Bookmarks
	c.Theme = fresh.Theme
	c.modTime = info.ModTime()

	return nil
}

func (c *Config) Snapshot() Config {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return Config{
		Greeting:   c.Greeting,
		Search:     c.Search,
		Categories: c.Categories,
		Bookmarks:  c.Bookmarks,
		Theme:      c.Theme,
	}
}

func (c *Config) AllAppURLs() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var urls []string
	for _, cat := range c.Categories {
		for _, app := range cat.Apps {
			if app.URL != "" {
				urls = append(urls, app.URL)
			}
		}
	}
	return urls
}
