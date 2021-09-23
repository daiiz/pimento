VERSION := 1.3
TIMEZONE := Asia/Tokyo

build:
	docker build -t daiiz/pimento:$(VERSION) .

run-server:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) \
		-p 5000:8080 \
		-v `pwd`/.env:/var/apps/.env \
		daiiz/pimento:$(VERSION)

run-bash:
	docker run --rm -it \
		daiiz/pimento:$(VERSION) \
		bash

run-server-dev:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) -e DEBUG=yes \
		-p 5000:8080 \
		-v `pwd`/tmp:/tmp \
		-v `pwd`/apps:/var/apps \
		-v `pwd`/.env:/var/apps/.env \
		-v `pwd`/docs:/var/apps/docs \
		-v `pwd`/static:/var/apps/static \
		daiiz/pimento:$(VERSION)

run-bash-dev:
	docker run --rm -it \
		-v `pwd`/docs:/var/apps/docs \
		daiiz/pimento:$(VERSION) \
		bash
