# https://hub.docker.com/r/nikolaik/python-nodejs
FROM nikolaik/python-nodejs:python3.10-nodejs16

# Python
# apps
RUN apt clean all && apt upgrade
RUN apt-get update && apt-get -y install nginx
RUN pip install flask uwsgi Pillow gunicorn python-dotenv firebase-admin google-cloud-storage google-auth
RUN python --version

# LuaLaTex
RUN apt-get install -y wget
RUN apt-get install -y \
  texlive-lang-japanese \
  texlive-luatex \
  texlive-latex-extra \
  texlive-latex-recommended \
  texlive-lang-cjk \
  xzdec \
  gnupg2 \
  texlive-generic-extra

# tlmgr
RUN tlmgr version
RUN tlmgr init-usertree
# RUN tlmgr option repository http://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2018/tlnet-final/
# RUN tlmgr install gentombow
# RUN tlmgr install pdfx
# RUN tlmgr install xmpincl
# RUN tlmgr install etoolbox
# RUN tlmgr install xcolor
# RUN tlmgr install titlesec
# RUN tlmgr install bxpapersize

# RUN tlmgr install tcolorbox
# RUN tlmgr install pgf
# RUN tlmgr install environ
# RUN tlmgr install trimspaces
# RUN tlmgr install colorprofiles

RUN tlmgr list --only-installed

# gentombow v0.9kやカスタムstyを追加する
RUN rm /usr/share/texlive/texmf-dist/tex/latex/gentombow/gentombow.sty
COPY --chown=nobody:nogroup sty /usr/share/texlive/texmf-dist/tex/latex/pimento_sty
RUN texhash

RUN rm /etc/nginx/sites-enabled/default
COPY --chown=nobody:nogroup default.conf /etc/nginx/conf.d/default.conf

COPY apps /var/apps
RUN rm -f /var/apps/app.sock

# 手元で追加したフォントをコピーする
COPY --chown=nobody:nogroup otf /usr/share/fonts/otf

# Googleフォントをダウンロードする
RUN cd /usr/share/fonts/otf && \
  wget https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf -O NotoSansJP-Bold.otf
RUN cd /usr/share/fonts/otf && \
  wget https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf -O NotoSansJP-Regular.otf

RUN mkdir -p /var/apps/docs /var/apps/docs/pdf
RUN mkdir -p /var/apps/docs/tex \
  /var/apps/docs/tex/gyazo-images \
  /var/apps/docs/tex/cmyk-gyazo-images \
  /var/apps/docs/tex/cmyk-gray-gyazo-images
RUN mkdir -p /var/apps/static/js

# Node.js
COPY client /var/apps/client
COPY package.json package-lock.json /var/apps/
RUN chown -R nobody:nogroup /var/apps/

WORKDIR /var/apps
RUN node --version
RUN npm install
RUN npm run build

# EXPOSE 80
ENV PORT 8080
ENV TEXMFCNF /var/apps:

USER nobody
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 app:app
