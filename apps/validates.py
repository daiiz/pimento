from firebase_helpers import is_allowed_user
from lib import is_local_tools_mode

def validate_firebase_user(user):
  if not user:
    if is_local_tools_mode():
      return None, None
    return 401, 'Unauthorized'
  if not is_allowed_user(user):
    return 403, 'Forbidden'
  return None, None


def validate_page_info(page_title_hash):
  if len(page_title_hash) != 32:
    return 400, 'Invalid page_title_hash'
  return None, None
