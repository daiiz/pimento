# 参考: https://github.com/daiiz/nlp-api-server/blob/main/middlewares.py
import os, json
from flask import request, g
from functools import wraps

from lib import is_local_tools_mode
from firebase_helpers import detect_firebase_user
from validates import validate_firebase_user

MESSAGE_INVALID_ENDPOINT = '[L] Not Found\n'
MESSAGE_INVALID_PROJECT_ID = 'Bad Request: project_id is required.'

def check_project_id(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    data = json.loads(request.data.decode('utf-8'))
    project_id = data.get('projectName', None)
    g.project_id = project_id
    if not is_local_tools_mode() and not project_id:
      return MESSAGE_INVALID_PROJECT_ID, 400
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
