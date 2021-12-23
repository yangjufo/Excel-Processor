import eel
import os
import pathlib
from collections import defaultdict

eel.init('web')

file_dict = defaultdict(int)
file_index = 0


@eel.expose
def upload_file(file_path, file_name):
    global file_index
    full_file_path = file_path
    if not file_path:
        full_file_path = pathlib.Path().resolve()
    full_file_path = os.path.join(full_file_path, file_name.split('\\')[-1])
    if not os.path.exists(full_file_path):
        return [False, full_file_path + ' 不存在']
    elif not os.path.isfile(full_file_path):
        return [False, full_file_path + ' 不是文件']
    file_dict[full_file_path] = file_index
    file_index += 1
    return [True, full_file_path]


@eel.expose
def delete_file_path(full_file_path):
    if full_file_path in file_dict:
        del file_dict[full_file_path]


eel.start('templates/index.html', size=(1920, 1080),
          jinja_templates='templates')
