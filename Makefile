VERSION := 1.1
TIMEZONE := Asia/Tokyo

build:
	rm -f ./apps/app.sock
	npm install
	npm run build
	docker build -t daiiz/pimento:$(VERSION) .

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
