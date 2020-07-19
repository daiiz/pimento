VERSION := 1.0
TIMEZONE := Asia/Tokyo

build:
	rm -f ./apps/app.sock
	docker build -t daiiz/pimento:$(VERSION) .

run-server:
	docker run --rm -it --name pimento \
		-e TZ=$(TIMEZONE) \
		-v `pwd`/apps:/var/apps \
		-v `pwd`/docs:/var/apps/docs \
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
