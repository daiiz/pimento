import urllib.error
import urllib.request
import os, re
from gcs_helpers import exists_object, upload_to_gcs

def is_valid_gyazo_team_name(gyazo_team_name):
  if not gyazo_team_name:
    return False
  if not re.match(r'^[a-zA-Z0-9]+$', gyazo_team_name):
    return False
  return True

# 原画と変換後のすべての画像がGCSに存在することを確かめる
def exists_images_in_artifacts(gyazo_id, object_base_name):
  if not object_base_name:
    return False
  image_types = ['gyazo-images', 'cmyk-gray-gyazo-images', 'cmyk-gyazo-images']
  for image_type in image_types:
    object_name = '{}/{}/{}'.format(object_base_name, image_type, gyazo_id)
    if image_type.startswith('cmyk-'):
      object_name += '.jpg'
  return exists_object('artifacts', object_name)


def download_images(gyazo_ids, docs_dir, object_base_name = None):
  saved_gyazo_ids = []
  if len(gyazo_ids) > 0:
    print('Gyazo image nums:', len(gyazo_ids))
  for gyazo_id in gyazo_ids:
    g_image_id = gyazo_id
    g_team_name = ''
    # `teamName/imageId`の形式の場合
    if '/' in gyazo_id:
      t_name, i_id = gyazo_id.split('/')
      if t_name and i_id:
        g_image_id = i_id
        g_team_name = t_name
    # すでにartifactsに存在する場合はダウンロード処理をスキップする
    if exists_images_in_artifacts(g_image_id, object_base_name):
      print('> Hit Gyazo in artifacts:', g_image_id)
      continue
    distPath = download_image(g_image_id, g_team_name, docs_dir, object_base_name)
    if distPath:
      saved_gyazo_ids.append(g_image_id)
  return saved_gyazo_ids


def download_image(gyazo_id, gyazo_team_name, docs_dir, object_base_name = None):
  if (not gyazo_id or len(gyazo_id) != 32):
    print('> Invalid Gyazo ID!')
    return ''

  url = 'https://gyazo.com/' + gyazo_id + '/raw'
  if is_valid_gyazo_team_name(gyazo_team_name):
    url = 'https://' + gyazo_team_name + '.gyazo.com/' + gyazo_id + '/raw'

  distPath = docs_dir + '/tex/gyazo-images/' + gyazo_id

  if (os.path.exists(distPath)):
    print('> Hit Gyazo:', gyazo_id)
    return distPath
  else:
    print('> Fetch Gyazo:', gyazo_id)

  try:
    res = urllib.request.urlopen(url)
    http_header = res.info()
    ext = http_header.get_content_subtype()
    if (http_header.get_content_maintype() != 'image'):
      return ''
    data = res.read()
    with open(distPath, mode="wb") as f:
      f.write(data)
  except urllib.error.URLError as err:
    print(err)
    return ''

  # upload to Google Cloud Storage
  if object_base_name:
    objectName = object_base_name + '/gyazo-images/' + gyazo_id
    upload_to_gcs('artifacts', objectName, distPath)

  return distPath
