.PHONY: build dev clean run build-web build-go

BINARY = homehub
GO = go
NPM = npm

all: build

build: build-web build-go

build-web:
	cd web && $(NPM) install && $(NPM) run build

build-go:
	$(GO) build -ldflags="-s -w" -o $(BINARY) .

dev:
	$(GO) run . & \
		while ! curl -s http://localhost:8080/api/config > /dev/null 2>&1; do sleep 0.5; done; \
		cd web && $(NPM) run dev

run:
	./$(BINARY)

clean:
	rm -f $(BINARY)
	rm -rf web/dist

build-linux:
	cd web && $(NPM) install && $(NPM) run build
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GO) build -ldflags="-s -w" -o $(BINARY) .
