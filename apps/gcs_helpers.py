import os, json, hashlib, datetime
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


def validate_gcs_file(bucket_name_key, object_name, file_path):
  if not is_valid_bucket_name_key(bucket_name_key):
    return 'bucket_name_key is invalid.'
  if not object_name or (not object_name.startswith('u_')):
    return 'object_name is invalid.'
  if (not file_path) or (not file_path.startswith('/tmp/user_')):
    return 'file_path is invalid.'
  return None


def create_page_object_name(user_id, project_id, page_title_hash):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)
  return 'u_{}/p_{}/a_{}.pdf'.format(md5(user_id), md5(project_id), page_title_hash)


def create_tex_object_name(user_id, project_id, prefix, page_title_hash):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)
  filename = '{}{}.tex'.format(prefix, page_title_hash)
  return 'u_{}/p_{}/a_{}/{}'.format(md5(user_id), md5(project_id), page_title_hash, filename)


# 記事フォルダの部分までのパスを返す
def create_image_object_base_name(user_id, project_id, page_title_hash):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)
  return 'u_{}/p_{}/a_{}'.format(md5(user_id), md5(project_id), page_title_hash)


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


# 引数の検証は呼び出し元で済ませる
def exists_object(bucket_name_key, object_name):
  bucket_name = bucket_names_dict.get(bucket_name_key)
  bucket = gcs_client.get_bucket(bucket_name)
  blob = bucket.blob(object_name)
  return blob.exists()


def upload_to_gcs(bucket_name_key, object_name, file_path = None, metadata = None):
  err_message = validate_gcs_file(bucket_name_key, object_name, file_path)
  if err_message:
    raise Exception(err_message)
  bucket_name = bucket_names_dict.get(bucket_name_key)
  bucket = gcs_client.get_bucket(bucket_name)
  blob = bucket.blob(object_name)

  if not os.path.exists(file_path):
    return
  print('Uploading...', '{}/{}'.format(bucket_name, object_name))

  content_type = 'application/octet-stream'
  if object_name.endswith('.tex'):
    content_type = 'text/plain; charset="UTF-8"'
  elif object_name.endswith('.jpg'):
    content_type = 'image/jpeg'
  elif object_name.endswith('.pdf'):
    content_type = 'application/pdf'

  blob.upload_from_filename(file_path, content_type=content_type)
  if metadata:
    blob.metadata = metadata
    blob.patch()

  print('Uploading... done.')


# GCSに保持しているartifactsを手元の作業ディレクトリに展開する
def extract_artifacts(user_id, project_id, page_title_hash, work_dir):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)
  if not work_dir.endswith('/'):
    work_dir += '/'

  dir_name = 'u_{}/p_{}/a_{}'.format(md5(user_id), md5(project_id), page_title_hash) + '/'

  bucket_name = bucket_names_dict.get('artifacts')
  bucket = gcs_client.get_bucket(bucket_name)
  blobs = bucket.list_blobs(prefix=dir_name)
  for blob in blobs:
    dest_file_path = work_dir + blob.name.replace(dir_name, '')
    if '/gyazo-images/' in dest_file_path:
      continue
    print('Downloading...', dest_file_path)
    blob.download_to_filename(dest_file_path)


def get_artifacts_metadata(user_id, project_id, page_title_hash):
  err_message = validate_object_info(project_id, page_title_hash)
  if err_message:
    raise Exception(err_message)

  dir_name = 'u_{}/p_{}/a_{}'.format(md5(user_id), md5(project_id), page_title_hash) + '/'

  bucket_name = bucket_names_dict.get('artifacts')
  bucket = gcs_client.get_bucket(bucket_name)
  blobs = bucket.list_blobs(prefix=dir_name)

  res = {
    'documents': [],
    'images': []
  }
  for blob in blobs:
    name = blob.name.replace(dir_name, '')
    # documents
    if name.endswith('.tex'):
      block_name = '-'
      if blob.metadata:
        block_name = blob.metadata.get('page_title', block_name)
      res['documents'].append({
        'name': name,
        'block_name': block_name,
        'bytes': blob.size,
        'updated': int(datetime.datetime.timestamp(blob.updated))
      })
    # images
    if name.startswith('gyazo-images/'):
      res['images'].append({
        'name': name.split('/')[-1] + '.jpg',
        'bytes': blob.size,
        'updated': int(datetime.datetime.timestamp(blob.updated))
      })
    print(blob.metadata)
  return res
