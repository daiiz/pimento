from firebase_helpers import is_allowed_user
from lib import is_local_server

def validate_firebase_user(user):
  if not user:
    if is_local_server():
      return None, None
    return 401, 'Unauthorized'
  if not is_allowed_user(user):
    return 403, 'Forbidden'
  return None, None
