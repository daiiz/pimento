import os
from PIL import Image

def converter(gyazo_id, dirname, docs_dir, gray = False):
  outPath = docs_dir + '/tex/' + dirname + '/' + gyazo_id + '.jpg'
  if (os.path.exists(outPath)):
    print('> Hit local file:', outPath)
    return

  image_path = docs_dir + '/tex/gyazo-images/' + gyazo_id
  # RGBA -> RGB
  rawImg = Image.open(image_path)
  if rawImg.mode is not 'RGB':
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
  return

def convert_to_cmyk(gyazo_ids, docs_dir):
  dirname = 'cmyk-gyazo-images'
  for gyazo_id in gyazo_ids:
    converter(gyazo_id, dirname, docs_dir, False)
  return dirname

def convert_to_gray(gyazo_ids, docs_dir):
  dirname = 'cmyk-gray-gyazo-images'
  for gyazo_id in gyazo_ids:
    converter(gyazo_id, dirname, docs_dir, True)
  return dirname
