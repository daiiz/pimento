import os

from dotenv import load_dotenv
load_dotenv()

def is_debug():
  debug = os.environ.get('DEBUG', False)
  if debug == 'yes':
    return True
  return False


def is_local_tools_mode():
  api_origin = os.environ.get('PIMENTO_API_ORIGIN', '')
  local_tools_mode = os.environ.get('LOCAL_TOOLS_MODE', None)
  return (local_tools_mode == 'true') and api_origin.startswith('http://localhost:')

