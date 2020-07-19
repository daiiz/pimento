import urllib.error
import urllib.request
import os
# from logger import push_log

def download_images(gyazo_ids = []):
  saved_gyazo_ids = []
  for gyazo_id in gyazo_ids:
    download_image(gyazo_id)
    saved_gyazo_ids.append(gyazo_id)
  return saved_gyazo_ids

def download_image(gyazo_id):
  if (len(gyazo_id) != 32): return ''

  url = 'https://gyazo.com/' + gyazo_id + '/raw'
  distPath = './docs/gyazo-images/' + gyazo_id

  if (os.path.exists(distPath)):
    print('> Hit local file:', gyazo_id)
    return distPath

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

  return distPath
