VERSION := 1.3
TIMEZONE := Asia/Tokyo

build:
	docker build -t daiiz/pimento:$(VERSION) .

run-server:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) \
		-p 5000:8080 \
		daiiz/pimento:$(VERSION)

run-bash:
	docker run --rm -it \
		daiiz/pimento:$(VERSION) \
		bash

run-server-dev:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) -e DEBUG=yes -e API_KEY=dev-dev-dev\
		-p 5000:8080 \
		-v `pwd`/apps:/var/apps \
		-v `pwd`/docs:/var/apps/docs \
		-v `pwd`/static:/var/apps/static \
		daiiz/pimento:$(VERSION)

run-bash-dev:
	docker run --rm -it \
		-v `pwd`/docs:/var/apps/docs \
		daiiz/pimento:$(VERSION) \
		bash
