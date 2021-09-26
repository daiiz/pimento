import os, json, hashlib
from google.cloud import storage
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

bucket_names_dict = {
  'artifacts': os.environ.get('GCS_BUCKET_NAME_ARTIFACTS', ''),
  'pages': os.environ.get('GCS_BUCKET_NAME_PAGES', '')
}

def md5 (text):
  hash_salt = os.environ.get('GCS_OBJECT_NAME_HASH_SALT', '')
  if hash_salt == '':
    raise Exception('hash_salt is empty.')
  return hashlib.md5((text + '/' + hash_salt).encode('utf-8')).hexdigest()


def is_valid_bucket_name_key(name_key):
  return name_key in bucket_names_dict.keys()


def validate_object_info(project_id, page_title_hash):
  if not project_id:
    return 'project_is is empty.'
  if not page_title_hash:
    return 'page_title_hash is empty.'
  return None


def create_page_object_name(user_id, project_id, page_title_hash):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)
  return 'u_{}/p_{}/a_{}.pdf'.format(md5(user_id), md5(project_id), page_title_hash)


def create_tex_object_name(user_id, project_id, page_title_hash):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)
  return 'u_{}/p_{}/a_{}/raw.tex'.format(md5(user_id), md5(project_id), page_title_hash)


def check_bucket_names_dict():
  for name_key in bucket_names_dict.keys():
    if not bucket_names_dict[name_key]:
      raise Exception('bucket_names_dict["{}"] is invalid.'.format(name_key))


def get_gcs_client():
  service_account_info = json.loads(os.environ.get('GCP_CREDENTIALS', ''))
  if not service_account_info:
    raise Exception('Invalid service_account')
  cred = Credentials.from_service_account_info(service_account_info)
  client = storage.Client(credentials=cred, project=service_account_info.get('project_id'))
  return client


check_bucket_names_dict()
gcs_client = get_gcs_client()


def upload_to_gcs(bucket_name_key, object_name, file_path = None):
  if not is_valid_bucket_name_key(bucket_name_key):
    raise Exception('bucket_name_key is invalid.')
  if not object_name:
    raise Exception('object_name is invalid.')
  if (not file_path) or (not file_path.startswith('/tmp/user_')):
    raise Exception('file_path is invalid.')
  bucket_name = bucket_names_dict.get(bucket_name_key)
  bucket = gcs_client.get_bucket(bucket_name)
  blob = bucket.blob(object_name)
  print('Uploading...', '{}/{}'.format(bucket_name, object_name))

  content_type = 'application/pdf'
  if object_name.endswith('.tex'):
    content_type = 'text/plain; charset="UTF-8"'
  blob.upload_from_filename(file_path, content_type=content_type)
  print('Uploading... done.')
