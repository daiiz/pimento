from flask import Flask, render_template, send_file, jsonify, request, abort
import os, subprocess, datetime, hashlib

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
  return jsonify({ "image_urls": [] }), 200

# for debug
if __name__ == "__main__":
  app.run()
