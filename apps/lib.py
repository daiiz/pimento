import os

def is_debug():
  debug = os.environ.get('DEBUG', False)
  if debug == 'yes':
    return True
  return False

def is_app_enabled(received_key = ''):
  api_key = os.environ.get('API_KEY', None)
  if api_key is None or len(api_key) == 0:
    return False
  # TODO: 一致を確認
  return True
