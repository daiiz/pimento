from flask import Flask, g, render_template, send_file, jsonify, request, abort
import os, subprocess, datetime, hashlib, json
import gyazo
import pimento
from lib import is_debug, is_local_tools_mode
from middlewares import check_app_enabled, check_firebase_user, only_for_local_tools

from validates import validate_page_info

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

docDir = os.getcwd() + '/docs/'
workDir = docDir + 'tex/'


@app.after_request
def set_cors_headers(response):
  response.headers.add('Access-Control-Allow-Origin', os.environ.get('PIMENTO_FRONTEND_ORIGIN'))
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS')
  return response


@app.route('/', methods=["GET"])
def index():
  now = datetime.datetime.now().strftime('%H:%M:%S.%f')
  return render_template('page.html', time=now)


@app.route('/frame', methods=["GET"])
def index_frame():
  now = datetime.datetime.now().strftime('%H:%M:%S.%f')
  return render_template('page.html', time=now, frame='true')


@app.route('/api/build/pages', methods=['POST'])
@check_firebase_user
def build_page_api():
  print('[build] is_local_tools_mode:', is_local_tools_mode())

  payload = json.loads(request.data.decode('utf-8'))
  data = payload.get('data', {})
  build_options = payload.get('buildOptions', {})

  # detect page title hash
  page_title_hash = data.get('pageTitleHash', '')
  doc_type = data.get('docType', '')
  status, message = validate_page_info(page_title_hash, doc_type)
  if status:
    return jsonify({ 'message': message }), status

  # get internal file path
  pdf_file_path = pimento.build_page_or_book(page_title_hash, build_options, docDir)

  if is_local_tools_mode():
    return jsonify({
      'tools_mode': 'local',
      'preview_pdf_path': '/{}/pdf/{}'.format(doc_type, page_title_hash),
      'preview_tex_path': '/{}/tex/{}'.format(doc_type, page_title_hash)
    }), 200

  print('>', '/{}/pdf/{}'.format(doc_type, page_title_hash))
  print('>', page_title_hash, g.user['name'], pdf_file_path)
  return jsonify({ 'build_options': build_options }), 200


@app.route('/api/convert/images', methods=["POST"])
@check_app_enabled
def convert_images():
  data = json.loads(request.data.decode('utf-8'))
  # Gyazo画像を保存する
  saved_gyazo_ids = gyazo.download.download_images(data['gyazoIds'] or [])
  # CMYK, Grayに変換して保存する
  dirnames = []
  dirnames.append(gyazo.convert.convert_to_cmyk(saved_gyazo_ids))
  dirnames.append(gyazo.convert.convert_to_gray(saved_gyazo_ids))
  return jsonify({ "gyazo_ids": saved_gyazo_ids, "dirnames": dirnames }), 200

# つぎはこれ
@app.route('/api/upload/page', methods=["POST"])
@check_firebase_user
def upload_page():
  data = json.loads(request.data.decode('utf-8'))
  print('[upload] is_local_tools_mode:', is_local_tools_mode())
  print('[upload] "{}" by {}'.format(data['pageTitle'], g.user['name']))
  isWhole = data['includeCover'] == True
  prefix = 'book_' if isWhole else 'page_'

  # detect page title hash
  page_title_hash = data.get('pageTitleHash', '')
  status, message = validate_page_info(page_title_hash)
  if status:
    return jsonify({ 'message': message }), status

  file_name = prefix + page_title_hash + '.tex'
  file_path = os.getcwd() + '/docs/tex/' + file_name
  texDocument = data['pageHead'] + '\n\n' + data['pageText'] + '\n\n' + data['pageTail']
  with open(file_path, 'w') as f:
    f.write(texDocument)
  # ページ単位でのTeXドキュメントを保存する
  return jsonify({
    "page_title_hash": page_title_hash,
    "tex_file_name": file_name
  }), 200


# コンパイルせずに既存のファイルを返すだけ
@app.route('/<string:doc_type>s/<string:file_type>/<string:page_title_hash>', methods=["GET"])
@only_for_local_tools
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

if __name__ == '__main__':
  app.run(host='localhost', port=8080, debug=is_debug())
