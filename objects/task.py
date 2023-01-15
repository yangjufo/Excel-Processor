

import pandas as pd
from openpyxl import load_workbook, Workbook
import os.path
from datetime import datetime


class BaseSelectSettings():
    def __init__(self, select_settings, input_file_map) -> None:
        self.select_settings = select_settings
        # input file
        self.file = input_file_map[self.select_settings['file']]
        self.sheet = self.select_settings['sheet'] if 'sheet' in self.select_settings else None
        # 分组列 / 筛选列
        self.group_column = self.select_settings['group-column'] if 'group-column' in self.select_settings else None
        self.group_column_min_value = self.select_settings[
            'group-column-min-value'] if 'group-column-min-value' in self.select_settings else None
        self.group_column_max_value = self.select_settings[
            'group-column-max-value'] if 'group-column-max-value' in self.select_settings else None
        # 数值列 / 匹配列
        self.value_column = self.select_settings['value-column']


class DataMatchSelectSettings(BaseSelectSettings):
    def __init__(self, select_settings_json, input_file_map) -> None:
        super().__init__(select_settings_json, input_file_map)
        self.match_condition = self.select_settings['match-condition']


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

    def _convert_group_column_value(self, group_value, select):
        if isinstance(group_value, datetime):
            if select.group_column_min_value is not None:
                select.group_column_min_value = datetime.strptime(
                    select.group_column_min_value, '%Y-%m-%d')
            if select.group_column_max_value is not None:
                select.group_column_max_value = datetime.strptime(
                    select.group_column_max_value, '%Y-%m-%d')
            return True
        if type(group_value) == int or type(group_value) == float:
            if select.group_column_min_value is not None:
                select.group_column_min_value = float(
                    select.group_column_min_value)
            if select.group_column_max_value is not None:
                select.group_column_max_value = float(
                    select.group_column_max_value)
            return True
        return False

    def run():
        pass


class SumTask(BaseTask):
    def __init__(self, task_settings, input_file_map) -> None:
        super().__init__(task_settings)
        for select_settings in self._task_settings['selects']:
            self.selects.append(BaseSelectSettings(
                select_settings, input_file_map))

    def run(self):
        if self._completed:
            return
        group_sums = {}
        sum = 0
        select = self.selects[0]
        headers = select.file.get_headers(None)[1]
        header_indexes = {headers[i]: i for i in range(len(headers))}
        group_column_values_checked = False
        group_column_values_converted = False
        for row in select.file.get_row_values(select.sheet).values.tolist():
            if select.group_column is not None:
                group_value = row[header_indexes[select.group_column]]
                if not group_column_values_checked:
                    group_column_values_converted = self._convert_group_column_value(
                        group_value, select)
                group_column_values_checked = True
                if not group_column_values_converted:
                    group_value = str(group_value)
                if select.group_column_min_value is not None and group_value < select.group_column_min_value:
                    continue
                if select.group_column_max_value is not None and group_value > select.group_column_max_value:
                    continue
                if group_value not in group_sums:
                    group_sums[group_value] = 0
                group_sums[group_value] += float(
                    row[header_indexes[select.value_column]])
            else:
                sum += float(row[header_indexes[select.value_column]])
        if len(group_sums) > 0:
            df = pd.DataFrame(group_sums.items(), columns=['分组列', '和'])
        else:
            df = pd.DataFrame([sum], columns=['和'])
        self._write_results(df)
        self._completed = True


class DataMatchTask(BaseTask):
    def __init__(self, task_settings, input_file_map) -> None:
        super().__init__(task_settings)
        for select_settings in self._task_settings['selects']:
            self.selects.append(DataMatchSelectSettings(
                select_settings, input_file_map))

    def run(self):
        if self._completed:
            return
        self._completed = True
