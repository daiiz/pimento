FROM python:3.6

# apps
RUN apt clean all && apt upgrade
RUN apt-get update && apt-get -y install nginx
RUN pip install flask uwsgi Pillow
RUN python --version

# LuaLaTex
