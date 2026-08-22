package internal

import "sync"

type Event struct {
	Name string
	Data []byte
}

// Broker is a lightweight fan-out hub for server-sent events. A slow
// subscriber is skipped (its buffer fills); it will be brought up to speed
// by the next full-snapshot publish.
type Broker struct {
	mu   sync.Mutex
	subs map[chan Event]struct{}
}

func NewBroker() *Broker {
	return &Broker{subs: make(map[chan Event]struct{})}
}

func (b *Broker) Subscribe() chan Event {
	ch := make(chan Event, 8)
	b.mu.Lock()
	b.subs[ch] = struct{}{}
	b.mu.Unlock()
	return ch
}

func (b *Broker) Unsubscribe(ch chan Event) {
	b.mu.Lock()
	delete(b.subs, ch)
	b.mu.Unlock()
}

func (b *Broker) Publish(e Event) {
	b.mu.Lock()
	defer b.mu.Unlock()
	for ch := range b.subs {
		select {
		case ch <- e:
		default:
		}
	}
}
