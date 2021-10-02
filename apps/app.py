from flask import Flask, g, render_template, send_file, jsonify, request, abort
import os, subprocess, datetime, hashlib, json
import pimento, gyazo
from lib import is_debug, is_local_tools_mode
from middlewares import check_firebase_user, check_project_id, only_for_local_tools
from gcs_helpers import upload_to_gcs, extract_artifacts \
  create_page_object_name, create_tex_object_name, create_image_object_base_name

from validates import validate_page_info

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

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
  return render_template('page.html',
    time=now,
    frame='true',
    frontend_origin=os.environ.get('PIMENTO_FRONTEND_ORIGIN', ''))


@app.route('/api/build/pages', methods=['POST'])
@check_firebase_user
@check_project_id
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
  docs_dir = pimento.create_user_docs_dir(g.user)

  # Google Cloud Storageに保持しているアーティファクトを手元に展開する
  if not is_local_tools_mode():
    extract_artifacts(g.user['uid'], g.project_id, page_title_hash, pimento.get_work_dir(docs_dir))

  pdf_file_path = pimento.build_page_or_book(page_title_hash, build_options, docs_dir)
  print('\n-----')

  if is_local_tools_mode():
    return jsonify({
      'tools_mode': 'local',
      'preview_pdf_path': '/x/{}/pdf/{}'.format(doc_type, page_title_hash),
      'preview_tex_path': '/x/{}/tex/{}'.format(doc_type, page_title_hash)
    }), 200

  # upload to Google Cloud Storage
  print('[build] project_id:', g.project_id)
  page_object_name = create_page_object_name(g.user['uid'], g.project_id, page_title_hash)
  upload_to_gcs('pages', page_object_name, file_path=pdf_file_path)

  print('>', '/{}/pdf/{}'.format(doc_type, page_title_hash))
  print('>', page_title_hash, g.user['name'], pdf_file_path)
  pimento.remove_user_works_dir(g.user)
  pimento.remove_user_pdf_file(pdf_file_path)

  return jsonify({
    'tools_mode': 'cloud',
    'doc_type': doc_type,
    'page_title_hash': page_title_hash
  }), 200


@app.route('/api/convert/images', methods=["POST"])
@check_firebase_user
@check_project_id
def convert_images():
  print('[convert images] is_local_tools_mode:', is_local_tools_mode())
  docs_dir = pimento.create_user_docs_dir(g.user)
  data = json.loads(request.data.decode('utf-8'))
  print('[convert images] project_id:', g.project_id)

  # detect page title hash
  page_title_hash = data.get('pageTitleHash', '')
  object_base_name = None
  if not is_local_tools_mode():
    object_base_name = create_image_object_base_name(g.user['uid'], g.project_id, page_title_hash)

  # Gyazo画像を保存する
  saved_gyazo_ids = gyazo.download.download_images(data.get('gyazoIds', []), docs_dir, object_base_name)
  # CMYK, Grayに変換して保存する
  dirnames = ['gyazo-images']
  dirnames.append(gyazo.convert.convert_to_cmyk(saved_gyazo_ids, docs_dir, object_base_name))
  dirnames.append(gyazo.convert.convert_to_gray(saved_gyazo_ids, docs_dir, object_base_name))
  if not is_local_tools_mode():
    pimento.remove_user_works_dir(g.user)

  return jsonify({ "gyazo_ids": saved_gyazo_ids, "dirnames": dirnames }), 200


@app.route('/api/upload/page', methods=["POST"])
@check_firebase_user
@check_project_id
def upload_page():
  data = json.loads(request.data.decode('utf-8'))
  print('[upload] is_local_tools_mode:', is_local_tools_mode())
  print('[upload] "{}" by {}'.format(data['pageTitle'], g.user['name']))
  print('[upload] project_id:', g.project_id)

  isWhole = data['includeCover'] == True
  prefix = 'book_' if isWhole else 'page_'

  # detect page title hash
  page_title_hash = data.get('pageTitleHash', '')
  status, message = validate_page_info(page_title_hash)
  if status:
    return jsonify({ 'message': message }), status

  # ページ単位でのTeXドキュメントを保存する
  # get internal file path
  docs_dir = pimento.create_user_docs_dir(g.user)
  file_name = prefix + page_title_hash + '.tex'
  file_path = docs_dir + '/tex/' + file_name
  texDocument = data['pageHead'] + '\n\n' + data['pageText'] + '\n\n' + data['pageTail']
  with open(file_path, 'w') as f:
    f.write(texDocument)

  # upload to Google Cloud Storage
  if not is_local_tools_mode():
    tex_object_name = create_tex_object_name(g.user['uid'], g.project_id, prefix, page_title_hash)
    metadata = {
      'page_title': data.get('pageTitle', '')
    }
    upload_to_gcs('artifacts', tex_object_name, file_path=file_path, metadata=metadata)
    pimento.remove_user_works_dir(g.user)

  return jsonify({
    "page_title_hash": page_title_hash,
    "tex_file_name": file_name
  }), 200


# コンパイルせずに既存のファイルを返すだけ
@app.route('/x/<string:doc_type>/<string:file_type>/<string:page_title_hash>', methods=["GET"])
@only_for_local_tools
def show_page(doc_type, file_type, page_title_hash):
  status, message = validate_page_info(page_title_hash, doc_type, file_type)
  if status:
    return jsonify({ 'message': message }), status

  docs_dir = pimento.create_user_docs_dir(None)
  # 複数形を単数形に変換: pages, books -> page, book
  doc_type = doc_type[:-1] if doc_type.endswith('s') else doc_type

  filePath = docs_dir + '/' + file_type + '/' + doc_type + '_' + page_title_hash + '.' + file_type
  if file_type == 'pdf':
    filePath = docs_dir + '/' + doc_type + '_' + page_title_hash + '.pdf'
  try:
    print('>', filePath)
    return send_file(filePath)
  except:
    return jsonify({ 'message': 'Not found' }), 404


if __name__ == '__main__':
  app.run(host='localhost', port=8080, debug=is_debug())
