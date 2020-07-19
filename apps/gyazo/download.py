import urllib.error
import urllib.request
import os
# from logger import push_log

def download_images(gyazo_ids = []):
  res = {}
  for gyazo_id in gyazo_ids:
    res[gyazo_id] = download_image(gyazo_id)
  return res

def download_image(gyazo_id):
  if (len(gyazo_id) != 32): return ''

  url = 'https://gyazo.com/' + gyazo_id + '/raw'
  distPath = './docs/gyazo-images/' + gyazo_id

  if (os.path.exists(distPath)):
    print('> Hit cache: ' + gyazo_id, 'fetchGyazoImage')
    return distPath

  try:
    res = urllib.request.urlopen(url)
    http_header = res.info()
    ext = http_header.get_content_subtype()
    if (http_header.get_content_maintype() != 'image'):
      return ''
    if (os.path.exists(distPath)):
      return distPath
    data = res.read()
    with open(distPath, mode="wb") as f:
      f.write(data)
  except urllib.error.URLError as err:
    print(err)
    return ''

  return distPath
