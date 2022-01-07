from random import random
import eel
import pathlib
from random import randint
from collections import defaultdict
from objects.file import BaseFile, CsvFile, XlsFile
from objects.task import BaseTask

input_file_map = defaultdict(BaseFile)
prev_output_path = str(pathlib.Path().resolve() /
                       "结果{0}.xlsx".format(randint(1, 10000)))
prev_output_sheet_map = defaultdict(int)
output_task_map = defaultdict(BaseTask)


@eel.expose
def re_initialize():
    global input_file_map, prev_output_path, prev_output_sheet_map
    input_file_map.clear()
    prev_output_path = str(pathlib.Path().resolve() /
                           "结果{0}.xlsx".format(randint(1, 10000)))
    prev_output_sheet_map.clear()


@ eel.expose
def get_next_output_path():
    global prev_output_path, prev_output_sheet_map
    return [prev_output_path, "页{0}".format(prev_output_sheet_map[prev_output_path] + 1)]


@ eel.expose
def get_sheet_names(file_path):
    global input_file_map
    try:
        return input_file_map[file_path].get_sheet_names()
    except Exception as e:
        return [False, e]


@ eel.expose
def get_headers(file_path, sheet_name):
    global input_file_map
    try:
        return input_file_map[file_path].get_headers(sheet_name)
    except Exception as e:
        return [False, e]


@ eel.expose
def get_column_values(file_path, sheet_name, column):
    global input_file_map
    try:
        return input_file_map[file_path].get_column_values(sheet_name, (int)(column.split(' ')[0]))
    except Exception as e:
        return [False, e]


@ eel.expose
def get_all_files():
    global input_file_map
    return [k for k in input_file_map.keys()]


@ eel.expose
def load_file(file_path, file_name):
    global input_file_map
    try:
        extension = file_name.split(".")[-1].lower()
        if extension not in ('csv', 'xls', 'xlsx'):
            return [False, "文件后缀名必须是以下之一：“.csv”, “.xls”, “.xlsx”"]

        # build absolute path
        absolute_file_path = file_path
        if not file_path:
            absolute_file_path = pathlib.Path().resolve()
        absolute_file_path = pathlib.Path(
            absolute_file_path) / file_name.split('\\')[-1]
        # validation
        if not absolute_file_path.exists():
            return [False, str(absolute_file_path) + ' 不存在']
        elif not absolute_file_path.is_file():
            return [False, str(absolute_file_path) + ' 不是文件']
        elif str(absolute_file_path) in input_file_map:
            return [False, str(absolute_file_path) + ' 已加载']

        # create file object
        if extension == 'csv':
            input_file_map[str(absolute_file_path)] = CsvFile(
                str(absolute_file_path))
        else:
            input_file_map[str(absolute_file_path)] = XlsFile(
                str(absolute_file_path))
        return [True, str(absolute_file_path)]
    except Exception as e:
        return [False, e]


@ eel.expose
def delete_file(file_path):
    global input_file_map
    if file_path in input_file_map:
        del input_file_map[file_path]


@ eel.expose
def add_task(task_type, task_settings):
    global output_task_map


if __name__ == "__main__":
    eel.init('web')
    eel.start('index.html', size=(1920, 720))
