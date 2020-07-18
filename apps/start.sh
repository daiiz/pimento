#!/bin/bash

cd /var/apps

uwsgi --ini /var/apps/app.ini &

nginx -g "daemon off;"
