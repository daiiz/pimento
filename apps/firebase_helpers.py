import os, json, firebase_admin
from firebase_admin import auth
from firebase_admin import credentials

from dotenv import load_dotenv
load_dotenv()

cred = credentials.Certificate(json.loads(os.getenv('GCP_CREDENTIALS')))
default_app = firebase_admin.initialize_app(cred)

allowed_user_emails = []
for email in os.getenv('ALLOW_USERS', '').split(','):
  allowed_user_emails.append(email.strip())


def get_id_token_from_request(req):
  idToken = req.headers.get('authorization', '')
  toks = idToken.split('Bearer ')
  if len(toks) != 2:
    return ''
  return toks[1]


def detect_firebase_user(req):
  id_token = get_id_token_from_request(req)

  if not id_token:
    return None
  try:
    firebase_user = auth.verify_id_token(id_token)
    return firebase_user
  except Exception as e:
    print(e)
    return None
  return None


def is_allowed_user(firebase_user):
  email = firebase_user.get('email', None)
  if not email:
    return False
  if len(allowed_user_emails) == 0:
    return False
  if '*' in allowed_user_emails:
    return True
  return email in allowed_user_emails
