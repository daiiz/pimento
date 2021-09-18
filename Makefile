VERSION := 1.3
TIMEZONE := Asia/Tokyo

build:
	docker build -t daiiz/pimento:$(VERSION) .

run-server-2:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) \
		-p 5000:80 \
		daiiz/pimento:$(VERSION)

run-server:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) \
		-v `pwd`/docs:/var/apps/docs \
		-p 5000:80 \
		daiiz/pimento:$(VERSION)

run-bash:
	docker run --rm -it \
		-v `pwd`/docs:/var/apps/docs \
		daiiz/pimento:$(VERSION) \
		bash

run-bash-2:
	docker run --rm -it \
		daiiz/pimento:$(VERSION) \
		bash
