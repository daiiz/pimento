import os
from PIL import Image

def converter(gyazo_id, dirname, gray = False):
  outPath = os.getcwd() + '/docs/tex/' + dirname + '/' + gyazo_id + '.jpg'
  if (os.path.exists(outPath)):
    print('> Hit local file:', outPath)
    return

  image_path = os.getcwd() + '/docs/tex/gyazo-images/' + gyazo_id
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

def convert_to_cmyk(gyazo_ids = []):
  dirname = 'cmyk-gyazo-images'
  for gyazo_id in gyazo_ids: converter(gyazo_id, dirname, False)
  return dirname

def convert_to_gray(gyazo_ids = []):
  dirname = 'cmyk-gray-gyazo-images'
  for gyazo_id in gyazo_ids: converter(gyazo_id, dirname, True)
  return dirname
