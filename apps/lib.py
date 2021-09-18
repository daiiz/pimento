import os

def is_debug():
  debug = os.environ.get('DEBUG', False)
  if debug == 'yes':
    return True
  return False
