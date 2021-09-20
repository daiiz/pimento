import os, subprocess

def get_work_dir(docDir):
  if not docDir:
    raise Exception('docDir is invalid')
  return docDir + 'tex/'


def create_user_work_dir(docDir):
  if not docDir:
    raise Exception('docDir is invalid')


def build_page_or_book(page_title_hash, build_options, docDir):
  workDir = get_work_dir(docDir)
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

  pdf_file_path = docDir + texFileName + '.pdf'
  try:
    # TeX文書内の参照番号解決のため、二度実行する
    if isWhole:
      subprocess.check_call(['lualatex', texFileName], shell=False, cwd=workDir)
    subprocess.check_call(['cp', workDir + texFileName + '.pdf', pdf_file_path])
  except Exception as e:
    print(e)
    return ''

  return pdf_file_path
