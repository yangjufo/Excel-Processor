

from objects.file import BaseFile

DEFAULT_READ_ROWS = 1000


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
        start_row_index = 1
        headers = select.file.get_headers(None)[1]
        header_indexes = {headers[i]: i for i in range(len(headers))}
        for row in select.file.get_row_values(select.sheet, start_row_index, DEFAULT_READ_ROWS).values.tolist():
            if select.group_column is not None:
                group_value = row[header_indexes[select.group_column]]
                if select.group_column_min_value is not None and group_value < select.group_column_min_value:
                    continue
                if select.group_column_max_value is not None and group_value > select.group_column_max_value:
                    continue
                if group_value not in group_sums:
                    group_sums[group_value] = 0
                group_sums[group_value] += float(row[select.value_column])
            else:
                sum += float(row[select.value_column])
            start_row_index += DEFAULT_READ_ROWS
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
