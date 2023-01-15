

import pandas as pd
from openpyxl import load_workbook
import os.path
from datetime import datetime
from collections import defaultdict
from enum import Enum


class BaseSelectSettings():
    def __init__(self, select_settings, input_file_map) -> None:
        self.select_settings = select_settings
        # input file
        self.file = input_file_map[self.select_settings['file']]
        self.sheet = self.select_settings['sheet'] if 'sheet' in self.select_settings else None
        self.headers = self.file.get_headers(self.sheet)[1]
        self.header_indexes = {
            self.headers[i]: i for i in range(len(self.headers))}
        # 分组列 / 筛选列
        self.group_column = self.select_settings['group-column'] if 'group-column' in self.select_settings else None
        self.group_column_min_value = self.select_settings[
            'group-column-min-value'] if 'group-column-min-value' in self.select_settings else None
        self.group_column_max_value = self.select_settings[
            'group-column-max-value'] if 'group-column-max-value' in self.select_settings else None
        self.group_column_values_converted = self.__convert_group_column_values()
        # 数值列 / 匹配列
        self.value_column = self.select_settings['value-column']

    def __convert_group_column_values(self):
        row = self.file.get_row_values(self.sheet, 1).values.tolist()[0]
        if self.group_column is None:
            return False
        group_value = row[
            self.header_indexes[self.group_column]]
        if isinstance(group_value, datetime):
            if self.group_column_min_value is not None:
                self.group_column_min_value = datetime.strptime(
                    self.group_column_min_value, '%Y-%m-%d')
            if self.group_column_max_value is not None:
                self.group_column_max_value = datetime.strptime(
                    self.group_column_max_value, '%Y-%m-%d')
            return True
        if type(group_value) == int or type(group_value) == float:
            if self.group_column_min_value is not None:
                self.group_column_min_value = float(
                    self.group_column_min_value)
            if self.group_column_max_value is not None:
                self.group_column_max_value = float(
                    self.group_column_max_value)
            return True
        return False


class SumSelectSettings(BaseSelectSettings):
    def __init__(self, select_settings_json, input_file_map) -> None:
        super().__init__(select_settings_json, input_file_map)
        sum_value = self.file.get_row_values(self.sheet, 1).values.tolist()[
            0][self.header_indexes[self.value_column]]
        if not((type(sum_value) == int) or type(sum_value) == float):
            raise Exception("数值列必须为数字！")


class DataMatchSelectSettings(BaseSelectSettings):
    def __init__(self, select_settings_json, input_file_map) -> None:
        super().__init__(select_settings_json, input_file_map)
        self.match_inclusion = self.select_settings['match-condition'] == '有'


class BaseTask():
    def __init__(self, task_settings) -> None:
        self._task_settings = task_settings
        self.selects = list()
        self._output_path = self._task_settings['output-file-path']
        self._output_sheet = self._task_settings['output-sheet-name']
        self._completed = False

    def _write_results(self, df: pd.DataFrame):
        if os.path.isfile(self._output_path):
            book = load_workbook(self._output_path)
            writer = pd.ExcelWriter(self._output_path, engine='openpyxl')
            writer.book = book
            df.to_excel(writer, sheet_name=self._output_sheet)
            writer.close()
        else:
            df.to_excel(self._output_path, sheet_name=self._output_sheet)

    def _should_exclude_row(self, group_value, select):
        if select.group_column is not None:
            if not select.group_column_values_converted:
                group_value = str(group_value)
            if select.group_column_min_value is not None and group_value < select.group_column_min_value:
                return True
            if select.group_column_max_value is not None and group_value > select.group_column_max_value:
                return True
        return False

    def run():
        pass


class SumTask(BaseTask):
    def __init__(self, task_settings, input_file_map) -> None:
        super().__init__(task_settings)
        for select_settings in self._task_settings['selects']:
            self.selects.append(SumSelectSettings(
                select_settings, input_file_map))

    def run(self):
        if self._completed:
            return
        group_sums = {}
        select = self.selects[0]
        for row in select.file.get_all_row_values(select.sheet).values.tolist():
            group_value = "所有" if select.group_column is None else row[
                select.header_indexes[select.group_column]]
            if self._should_exclude_row(group_value, select):
                continue
            if group_value not in group_sums:
                group_sums[group_value] = 0
            group_sums[group_value] += float(
                row[select.header_indexes[select.value_column]])
        self._write_results(pd.DataFrame(
            group_sums.items(), columns=['分组列', '和']))
        self._completed = True


class DataMatchTask(BaseTask):
    def __init__(self, task_settings, input_file_map) -> None:
        super().__init__(task_settings)
        for select_settings in self._task_settings['selects']:
            self.selects.append(DataMatchSelectSettings(
                select_settings, input_file_map))

    def __get_selected_rows(self, select):
        selected_rows = defaultdict(list)
        for row in select.file.get_all_row_values(
                select.sheet).values.tolist():
            group_value = None if select.group_column is None else row[
                select.header_indexes[select.group_column]]
            if self._should_exclude_row(group_value, select):
                continue
            selected_rows[row[
                select.header_indexes[select.value_column]]].append(row)
        return selected_rows

    def run(self):
        if self._completed:
            return
        select_1 = self.selects[0]
        select_2 = self.selects[1]
        selected_rows_1 = self.__get_selected_rows(select_1)
        selected_rows_2 = self.__get_selected_rows(select_2)
        results = list()
        if select_1.match_inclusion and select_2.match_inclusion:
            results.append([
                header.split(' ', 1)[1] for header in select_1.headers]
                + [header.split(' ', 1)[1] for header in select_2.headers[0:select_2.header_indexes[select_2.value_column]]] + [
                header.split(' ', 1)[1] for header in select_2.headers[select_2.header_indexes[select_2.value_column] + 1:]])
            for match_value, rows in selected_rows_1.items():
                if match_value in selected_rows_2:
                    for row_1 in rows:
                        for row_2 in selected_rows_2[match_value]:
                            results.append(row_1 + row_2[0:select_2.header_indexes[select_2.value_column]]
                                           + row_2[select_2.header_indexes[select_2.value_column] + 1:])
        elif select_1.match_inclusion:
            results.append([
                header.split(' ', 1)[1] for header in select_1.headers])
            for match_value, rows in selected_rows_1.items():
                if match_value not in selected_rows_2:
                    results += rows
        elif select_2.match_inclusion:
            results.append([
                header.split(' ', 1)[1] for header in select_2.headers])
            for match_value, rows in selected_rows_2.items():
                if match_value not in selected_rows_1:
                    results += rows
        self._write_results(pd.DataFrame(results))

        self._completed = True
