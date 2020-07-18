VERSION := 1.0
TIMEZONE := Asia/Tokyo

build:
	rm -f ./apps/app.sock
	docker build -t daiiz/pimento:$(VERSION) .

run-server:
	echo "hello"

rerun:
	$(info $(VERSION))

run-bash:
	docker run --rm -it \
		daiiz/pimento:$(VERSION) \
		bash
