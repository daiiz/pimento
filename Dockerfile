FROM python:3.6

# apps
RUN apt clean all && apt upgrade
RUN apt-get update && apt-get -y install nginx
RUN pip install flask uwsgi Pillow
RUN python --version

# LuaLaTex
RUN apt-get install -y \
  texlive-lang-japanese \
  texlive-luatex \
  texlive-latex-recommended \
  texlive-lang-cjk \
  wget \
  xzdec \
  gnupg2 \
  texlive-generic-extra

# tlmgr
RUN tlmgr init-usertree
RUN tlmgr option repository http://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2018/tlnet-final/
# RUN tlmgr install gentombow
RUN tlmgr install bxpapersize
RUN tlmgr install pdfx
RUN tlmgr install xmpincl
RUN tlmgr install etoolbox
RUN tlmgr install xcolor
RUN tlmgr install titlesec
RUN tlmgr install bxpapersize

RUN tlmgr version
RUN tlmgr list --only-installed

# gentombow v0.9kやカスタムstyを追加する
RUN rm /usr/share/texlive/texmf-dist/tex/latex/gentombow/gentombow.sty
COPY sty /usr/share/texlive/texmf-dist/tex/latex/pimento_sty
RUN texhash

RUN rm /etc/nginx/sites-enabled/default
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["bash", "/var/apps/start.sh"]
