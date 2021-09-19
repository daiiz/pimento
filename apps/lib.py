import os

from dotenv import load_dotenv
load_dotenv()

def is_debug():
  debug = os.environ.get('DEBUG', False)
  if debug == 'yes':
    return True
  return False


def is_app_enabled(received_key = ''):
  api_key = os.environ.get('API_KEY', '').strip()
  if not api_key:
    return False
  # 開発モードでは何らかの文字列が渡されていればOK
  if is_debug():
    return True
  # TODO: 一致を確認
  return False


def is_local_tools_mode():
  api_origin = os.environ.get('PIMENTO_API_ORIGIN', '')
  local_tools_mode = os.environ.get('LOCAL_TOOLS_MODE', None)
  return (local_tools_mode == 'true') and api_origin.startswith('http://localhost:')

