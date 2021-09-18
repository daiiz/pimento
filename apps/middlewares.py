# 参考: https://github.com/daiiz/nlp-api-server/blob/main/middlewares.py
from functools import wraps
from lib import is_app_enabled

MESSAGE_INVALID_API_KEY = 'Bad Request: API key is invalid.\n'

def check_app_enabled(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    is_enabled = is_app_enabled()
    if not is_enabled:
      return MESSAGE_INVALID_API_KEY, 400
    return f(*args, **kwargs)
  return decorated_function
