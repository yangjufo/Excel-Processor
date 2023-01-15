import eel
import pathlib
from random import randint
from collections import defaultdict
from objects.file import BaseFile, CsvFile, XlsFile
from objects.task import BaseTask, SumTask, DataMatchTask
import traceback

input_file_map = defaultdict(BaseFile)
prev_output_path = str(pathlib.Path().resolve() /
                       "结果{0}.xlsx".format(randint(1, 10000)))
prev_output_sheet_map = defaultdict(int)
output_task_map = defaultdict(lambda: defaultdict(BaseTask))


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
    except Exception:
        traceback.print_exc()
        return [False, "遇到一个异常，请查看日志！"]


@ eel.expose
def get_headers(file_path, sheet_name):
    global input_file_map
    try:
        return input_file_map[file_path].get_headers(sheet_name)
    except Exception:
        traceback.print_exc()
        return [False, "遇到一个异常，请查看日志！"]


@ eel.expose
def get_column_values(file_path, sheet_name, column, exclude_header=True):
    global input_file_map
    try:
        cols = input_file_map[file_path].get_column_values(
            sheet_name, (int)(column.split(' ')[0]), exclude_header)[1]
        return [True, cols]
    except Exception:
        traceback.print_exc()
        return [False, "遇到一个异常，请查看日志！"]


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
    except Exception:
        traceback.print_exc()
        return [False, "遇到一个异常，请查看日志！"]


@ eel.expose
def delete_file(file_path):
    global input_file_map
    delete_tasks = defaultdict(list)
    if file_path in input_file_map:
        for output_file_path, output_sheet_task in output_task_map.items():
            for output_sheet, task in output_sheet_task.items():
                for select in task.selects:
                    if select.file.path == file_path:
                        delete_tasks[output_file_path].append(output_sheet)
        del input_file_map[file_path]
    output_keys = list()
    for output_file_path, output_sheet_list in delete_tasks.items():
        for output_sheet in output_sheet_list:
            output_keys.append(output_file_path + ":" + output_sheet)
            del output_task_map[output_file_path][output_sheet]
    return output_keys


@ eel.expose
def add_task(task_settings_json):
    global output_task_map, input_file_map
    output_file_path = task_settings_json['output-file-path']
    output_sheet_name = task_settings_json['output-sheet-name']
    if output_file_path in output_task_map and output_sheet_name in output_task_map[output_file_path]:
        return [False, output_file_path + ':' + output_sheet_name + ' 已存在']
    if task_settings_json['task-type'] == 'sum':
        output_task_map[output_file_path][output_sheet_name] = SumTask(
            task_settings_json, input_file_map)
    elif task_settings_json['task-type'] == 'data-match':
        output_task_map[output_file_path][output_sheet_name] = DataMatchTask(
            task_settings_json, input_file_map)
    return [True, None]


@ eel.expose
def run_all_tasks():
    global output_task_map
    if len(output_task_map) == 0:
        return [False, "请先添加任务！"]
    output_paths = set()
    for output_path, output_sheet_task in output_task_map.items():
        for _, task in output_sheet_task.items():
            try:
                task.run()
                output_paths.add(output_path)
            except Exception:
                traceback.print_exc()
                return [False, "遇到一个异常，请查看日志！"]
    return [True, '任务完成，请在文件 [' + '、'.join(output_paths) + ' 中查看结果！']


if __name__ == "__main__":
    eel.init('web')
    eel.start('index.html', size=(1920, 720))
