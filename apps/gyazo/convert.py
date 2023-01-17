import os
from PIL import Image
from gcs_helpers import upload_to_gcs

def converter(gyazo_id, dirname, docs_dir, object_base_name, gray = False):
  filename = dirname + '/' + gyazo_id + '.jpg'
  outPath = docs_dir + '/tex/' + filename
  if (os.path.exists(outPath)):
    print('> Hit local Gyazo file:', outPath)
    return
  else:
    print('> Converting Gyazo file ({}):'.format(dirname), gyazo_id)

  image_path = docs_dir + '/tex/gyazo-images/' + gyazo_id
  # RGBA -> RGB
  rawImg = Image.open(image_path)
  if rawImg.mode != 'RGB':
    rawImg = rawImg.convert('RGBA')
    rawImg.load()
    im = Image.new('RGBA', rawImg.size, (255, 255, 255))
    im.paste(rawImg, mask=rawImg.split()[3]) # 3: alpha channel
    im.convert('RGB')
  else:
    im = rawImg

  if gray:
    imCmyk = im.convert('CMYK').convert('L')
  else:
    imCmyk = im.convert('CMYK')

  imCmyk.save(outPath)

  # upload to Google Cloud Storage
  if object_base_name:
    objectName = object_base_name + '/' + filename
    upload_to_gcs('artifacts', objectName, file_path=outPath)
  return

def convert_to_cmyk(gyazo_ids, docs_dir, object_base_name = None):
  dirname = 'cmyk-gyazo-images'
  for gyazo_id in gyazo_ids:
    converter(gyazo_id, dirname, docs_dir, object_base_name, False)
  return dirname

def convert_to_gray(gyazo_ids, docs_dir, object_base_name = None):
  dirname = 'cmyk-gray-gyazo-images'
  for gyazo_id in gyazo_ids:
    converter(gyazo_id, dirname, docs_dir, object_base_name, True)
  return dirname
