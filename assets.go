package main

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed web/dist/*
var embeddedFiles embed.FS

func staticFS() http.FileSystem {
	sub, err := fs.Sub(embeddedFiles, "web/dist")
	if err != nil {
		panic("embedded web/dist not found: " + err.Error())
	}
	return http.FS(sub)
}
