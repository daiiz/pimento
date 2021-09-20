import os, subprocess, shutil
from lib import is_local_tools_mode

def get_work_dir(docDir):
  if not docDir:
    raise Exception('docDir is invalid')
  return docDir + '/tex'


def get_user_dir_path(user_id):
  uid = user_id.strip()
  if not uid:
    raise Exception('user_id is invalid')
  return '/tmp/user_' + uid


# docsDirのパスを返す。なければ作る。
def create_user_docs_dir(user):
  if is_local_tools_mode():
    return os.getcwd() + '/docs'

  user_id = user.get('uid', None)
  if not user_id:
    raise Exception('user_id is required')
  user_dir_path = get_user_dir_path(user_id)
  user_docs_dir_path = user_dir_path + '/docs'

  if os.path.exists(get_work_dir(user_docs_dir_path)):
    return user_docs_dir_path
  else:
    os.makedirs(user_docs_dir_path, exist_ok=True)

  require_dir_paths = [
    '/tex',
    '/tex/gyazo-images',
    '/tex/cmyk-gyazo-images',
    '/tex/cmyk-gray-gyazo-images'
  ]
  for dir_path in require_dir_paths:
    os.makedirs(user_docs_dir_path + dir_path, exist_ok=True)
  return user_docs_dir_path


def remove_user_works_dir(user):
  if not user or is_local_tools_mode():
    return

  user_id = user.get('uid', None)
  if not user_id:
    raise Exception('user_id is required')
  user_dir_path = get_user_dir_path(user_id)
  user_works_dir_path = get_work_dir(user_dir_path + '/docs')

  if os.path.exists(user_works_dir_path) \
    and user_works_dir_path.startswith('/tmp/user_') \
    and user_works_dir_path.endswith('/tex'):
    shutil.rmtree(user_works_dir_path)
    print('removed:', user_works_dir_path)


def build_page_or_book(page_title_hash, build_options, docDir):
  workDir = get_work_dir(docDir) + '/'
  print('workDir: ', workDir)

  # parse build options
  isWhole = build_options.get('whole', False)
  insertIndex = build_options.get('index', False)
  refresh = build_options.get('refresh', False)

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
      print(e)
      return ''

  pdf_file_path = docDir + '/' + texFileName + '.pdf'
  try:
    # TeX文書内の参照番号解決のため、二度実行する
    if isWhole:
      subprocess.check_call(['lualatex', texFileName], shell=False, cwd=workDir)
    subprocess.check_call(['cp', workDir + texFileName + '.pdf', pdf_file_path])
  except Exception as e:
    print(e)
    return ''

  return pdf_file_path
