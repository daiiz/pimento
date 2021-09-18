VERSION := 1.2
TIMEZONE := Asia/Tokyo

# npm install
# npm run build

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
		-v `pwd`/apps:/var/apps \
		-v `pwd`/docs:/var/apps/docs \
		-v `pwd`/static:/var/apps/static \
		-v `pwd`/otf:/usr/share/fonts/otf \
		-p 5000:80 \
		daiiz/pimento:$(VERSION)

run-bash:
	docker run --rm -it \
		-v `pwd`/apps:/var/apps \
		-v `pwd`/docs:/var/apps/docs \
		-v `pwd`/otf:/usr/share/fonts/otf \
		daiiz/pimento:$(VERSION) \
		bash

run-bash-2:
	docker run --rm -it \
		daiiz/pimento:$(VERSION) \
		bash
