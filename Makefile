VERSION := 1.0
TIMEZONE := Asia/Tokyo

build:
	rm -f ./apps/app.sock
	docker build -t daiiz/pimento:$(VERSION) .
