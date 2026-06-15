FROM node:22-alpine AS frontend
WORKDIR /src
COPY web/ .
RUN npm install && npm run build

FROM golang:1.26-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY *.go ./
COPY internal/ internal/
COPY --from=frontend /src/dist web/dist/
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o homehub .

FROM alpine:3.21
RUN apk add --no-cache ca-certificates
COPY --from=builder /src/homehub /homehub
EXPOSE 8080
ENTRYPOINT ["/homehub"]
