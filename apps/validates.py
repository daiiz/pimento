from firebase_helpers import is_allowed_user

def validate_firebase_user(user):
  if not user:
    return 401, 'Unauthorized'
  if not is_allowed_user(user):
    return 403, 'Forbidden'
  return None, None


def validate_page_info(page_title_hash, doc_type = None):
  if len(page_title_hash) != 32:
    return 400, 'Invalid page_title_hash'
  if doc_type:
    if doc_type not in ['pages', 'books']:
      return 400, 'Invalid doc_type "{}"'.format(doc_type)
  return None, None
