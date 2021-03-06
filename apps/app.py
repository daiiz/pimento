from flask import Flask, render_template, send_file, jsonify, request, abort
import os, subprocess, datetime, hashlib, json

import gyazo

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

docDir = './docs/'
workDir = docDir + 'tex/'

@app.route('/', methods=["GET"])
def index():
  now = datetime.datetime.now().strftime('%H:%M:%S.%f')
  return render_template('page.html', time=now)

@app.route('/build/pages/<string:page_title_hash>', methods=["POST"])
def build_page(page_title_hash):
  if len(page_title_hash) != 32:
    return jsonify({ 'message': 'Invalid page_title_hash' }), 400
  isWhole = request.args.get('whole') == '1'
  insertIndex = request.args.get('index') == '1'
  refresh = request.args.get('refresh') == '1'
  prefix = 'book_' if isWhole else 'page_'
  texFileName = prefix + page_title_hash
  texFilePath = texFileName + '.tex'
  # ビルド前にauxファイルを削除する
  auxFilePath = docDir + texFileName + '.aux'

  if refresh and os.path.isfile(auxFilePath):
    os.remove(auxFilePath)
  try:
    subprocess.check_call(['lualatex', texFileName], shell=False, cwd=workDir)
  except Exception as e:
    pass

  # 索引を作る
  if insertIndex:
    try:
      subprocess.check_call(['upmendex', '-g', texFileName], shell=False, cwd=workDir)
      subprocess.check_call(['lualatex', texFileName], shell=False, cwd=workDir)
    except Exception as e:
      pass

  # TeX文書内の参照番号解決のため、二度実行する
  try:
    if isWhole:
      subprocess.check_call(['lualatex', texFileName], shell=False, cwd=workDir)
    subprocess.check_call(['cp', workDir + texFileName + '.pdf', docDir + texFileName + '.pdf'])
  except Exception as e:
    print(e)
    return send_file(docDir + texFilePath, mimetype='text/plain')
  return send_file(docDir + texFileName + '.pdf')

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
  isWhole = request.args.get('whole') == '1'
  prefix = 'book_' if isWhole else 'page_'
  file_name = prefix + data['pageTitleHash'] + '.tex'
  file_path = './docs/tex/' + file_name
  texDocument = data['pageHead'] + '\n\n' + data['pageText'] + '\n\n' + data['pageTail']
  with open(file_path, 'w') as f:
    f.write(texDocument)
  # ページ単位でのTeXドキュメントを保存する
  return jsonify({
    "page_title_hash": data['pageTitleHash'],
    "tex_file_name": file_name
  }), 200

# コンパイルせずに既存のファイルを返すだけ
@app.route('/<string:doc_type>s/<string:file_type>/<string:page_title_hash>', methods=["GET"])
def show_page(doc_type, file_type, page_title_hash):
  if len(page_title_hash) != 32:
    return jsonify({ 'message': 'Invalid page_title_hash' }), 400
  if file_type not in ['tex', 'pdf']:
    return jsonify({ 'message': 'Invalid file_type' }), 400
  if doc_type not in ['page', 'book']:
    return jsonify({ 'message': 'Invalid doc_type' }), 400

  filePath = docDir + file_type + '/' + doc_type + '_' + page_title_hash + '.' + file_type
  if file_type == 'pdf':
    filePath = docDir + doc_type + '_' + page_title_hash + '.pdf'
  try:
    return send_file(filePath)
  except:
    return jsonify({ 'message': 'Not found' }), 404

# for debug
if __name__ == "__main__":
  app.run()
