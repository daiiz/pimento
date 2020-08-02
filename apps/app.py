from flask import Flask, render_template, send_file, jsonify, request, abort
import os, subprocess, datetime, hashlib, json

import gyazo

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

@app.route('/', methods=["GET"])
def index():
  now = datetime.datetime.now().strftime('%H:%M:%S.%f')
  return render_template('page.html', time=now)

@app.route('/build', methods=["GET"])
def build():
  texFilePath = 'tex/sample.tex'
  try:
    proc = subprocess.call(['lualatex', texFilePath], shell=False, cwd='./docs')
  except:
    return send_file('./docs/' + texFilePath, mimetype='text/plain')
  return send_file('./docs/sample.pdf', mimetype='application/pdf')

@app.route('/api/convert/images', methods=["POST"])
def convert_images():
  data = json.loads(request.data.decode('utf-8'))
  # Gyazo画像を保存する
  saved_gyazo_ids = gyazo.download.download_images(data['gyazoIds'] or [])
  # CMYK, Grayに変換して保存する
  dirnames = []
  dirnames.append(gyazo.convert.convert_to_cmyk(saved_gyazo_ids))
  dirnames.append(gyazo.convert.convert_to_gray(saved_gyazo_ids))
  return jsonify({ "gyazo_ids": saved_gyazo_ids, "dirnames": dirnames }), 200

@app.route('/api/upload/page', methods=["POST"])
def upload_page():
  data = json.loads(request.data.decode('utf-8'))
  file_name = 'page_' + data['pageTitleHash'] + '.tex'
  file_path = './docs/tex/' + file_name
  with open(file_path, 'w') as f:
    f.write(data['pageText'])
  # ページ単位でのTeXドキュメントを保存する
  return jsonify({
    "page_title_hash": data['pageTitleHash'],
    "tex_file_name": file_name
  })

# 不要かも?
@app.route('/api/convert/tex', methods=["POST"])
def convert_tex_document():
  return jsonify({ "pdf_file_url": "" }), 200

# for debug
if __name__ == "__main__":
  app.run()
