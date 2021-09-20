# 参考: https://github.com/daiiz/nlp-api-server/blob/main/middlewares.py
import os
from flask import request, g
from functools import wraps

from lib import is_app_enabled, is_local_tools_mode
from firebase_helpers import detect_firebase_user
from validates import validate_firebase_user

MESSAGE_INVALID_API_KEY = 'Bad Request: API key is invalid.\n'
MESSAGE_INVALID_ENDPOINT = '[L] Not Found\n'

def check_app_enabled(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if not is_app_enabled():
      return MESSAGE_INVALID_API_KEY, 400
    return f(*args, **kwargs)
  return decorated_function


def check_firebase_user(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    user = detect_firebase_user(request)
    err_status, message = validate_firebase_user(user)
    # ローカルツールモードであれば常に通過させる
    if err_status and is_local_tools_mode():
      err_status = None
    if err_status:
      return message, err_status
    if user:
      print('[user]', user['name'])
      g.user = user
    else:
      g.user = { 'name': '??' }
    return f(*args, **kwargs)
  return decorated_function


def only_for_local_tools(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if not is_local_tools_mode():
      return MESSAGE_INVALID_ENDPOINT, 404
    return f(*args, **kwargs)
  return decorated_function
