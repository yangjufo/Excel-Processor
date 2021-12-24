from datetime import datetime
import eel
import os
import pathlib
from collections import defaultdict
import pandas as pd
import random

eel.init('web')

input_file_set = set()
output_sheet_dict = defaultdict(int)
prev_output_path = os.path.join(pathlib.Path().resolve(), "结果.xlsx")


@eel.expose
def re_initialize():
    global input_file_set, output_sheet_dict, prev_output_path
    input_file_set.clear()
    output_sheet_dict.clear()
    prev_output_path = os.path.join(
        pathlib.Path().resolve(), "结果" + str(random.randint(1, 10000)) + ".xlsx")


@ eel.expose
def get_output_path(file=None):
    global prev_output_path, output_sheet_dict
    if file and file in output_sheet_dict:
        prev_output_path = file
    return [prev_output_path, "页" + str(output_sheet_dict[prev_output_path] + 1)]


def get_xls_sheet_list(file_path):
    try:
        xls_reader = pd.ExcelFile(file_path)
        return [True, xls_reader.sheet_names]
    except Exception as e:
        return [False, e]


@ eel.expose
def get_sheet_list(file_path):
    try:
        if file_path.endswith(".csv"):
            return [True, []]
        return get_xls_sheet_list(file_path)
    except Exception as e:
        return [False, e]


def get_csv_column_list(file_path):
    try:
        csv_reader = pd.read_csv(file_path, nrows=1, header=None)
        index = 0
        cols = list()
        for c in csv_reader.values.tolist()[0]:
            cols.append(str(index) + " " + str(c))
            index += 1
        return [True, cols]
    except Exception as e:
        return [False, e]


def get_xls_column_list(file_path, sheet_name):
    try:
        xls_reader = pd.read_excel(
            file_path, sheet_name=sheet_name, nrows=1, header=None)
        index = 0
        cols = list()
        for c in xls_reader.values.tolist()[0]:
            cols.append(str(index) + " " + str(c))
            index += 1
        return [True, cols]
    except Exception as e:
        return [False, e]


@ eel.expose
def get_column_list(file_path, sheet_name):
    try:
        if file_path.endswith(".csv"):
            return get_csv_column_list(file_path)
        return get_xls_column_list(file_path, sheet_name)
    except Exception as e:
        return [False, e]


def get_csv_column_values(file_path, column_index):
    try:
        csv_reader = pd.read_csv(file_path, usecols=[column_index])
        cols = set()
        for c in csv_reader.values.tolist():
            cols.add(c[0])
        return [True, sorted(cols)]
    except Exception as e:
        return [False, e]


def get_xls_column_values(file_path, sheet_name, column_index):
    try:
        xls_reader = pd.read_excel(
            file_path, sheet_name=sheet_name, header=None, usecols=[column_index])
        cols = set()
        for c in xls_reader.values.tolist():
            if isinstance(c[0], datetime):
                cols.add(c[0].strftime('%Y-%m-%d'))
            else:
                cols.add(str(c[0]))
        return [True, sorted(cols)]
    except Exception as e:
        return [False, e]


@ eel.expose
def get_column_values(file_path, sheet_name, column):
    try:
        column_index = (int)(column.split(' ')[0])
        if file_path.endswith(".csv"):
            return get_csv_column_values(file_path, column_index)
        return get_xls_column_values(file_path, sheet_name, column_index)
    except Exception as e:
        return [False, e]


@ eel.expose
def upload_file(file_path, file_name):
    global input_file_set
    try:
        full_file_path = file_path
        if not file_path:
            full_file_path = pathlib.Path().resolve()
        full_file_path = os.path.join(
            full_file_path, file_name.split('\\')[-1])
        if not os.path.exists(full_file_path):
            return [False, full_file_path + ' 不存在']
        elif not os.path.isfile(full_file_path):
            return [False, full_file_path + ' 不是文件']
        elif not (file_name.endswith(".csv") or file_name.endswith(".xls") or file_name.endswith(".xlsx")):
            return [False, "文件后缀名必须是以下之一：“.csv”, “.xls”, “.xlsx”"]
        elif full_file_path in input_file_set:
            return [False, full_file_path + ' 已加载']
        input_file_set.add(full_file_path)
        return [True, full_file_path]
    except Exception as e:
        return [False, e]


@ eel.expose
def delete_file_path(full_file_path):
    if full_file_path in input_file_dict:
        del input_file_dict[full_file_path]


if __name__ == "__main__":
    eel.start('templates/index.html', size=(1920, 720),
              jinja_templates='templates')
