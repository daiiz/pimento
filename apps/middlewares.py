# 参考: https://github.com/daiiz/nlp-api-server/blob/main/middlewares.py
import os
from functools import wraps
from lib import is_app_enabled, is_local_tools_mode

MESSAGE_INVALID_API_KEY = 'Bad Request: API key is invalid.\n'
MESSAGE_INVALID_ENDPOINT = 'Not Found\n'

def check_app_enabled(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if not is_app_enabled():
      return MESSAGE_INVALID_API_KEY, 400
    return f(*args, **kwargs)
  return decorated_function


def only_for_local_tools(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if not is_local_tools_mode():
      return MESSAGE_INVALID_ENDPOINT, 404
    return f(*args, **kwargs)
  return decorated_function
