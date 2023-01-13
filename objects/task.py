

from objects.file import BaseFile


class BaseSelectSettings():
    def __init__(self, select_settings, input_file_map) -> None:
        self._select_settings = select_settings
        # input file
        self.file = input_file_map[self._select_settings['file']]
        if 'sheet' in self._select_settings:
            self._sheet = self._select_settings['sheet']  # selected sheet
        # 分组列 / 筛选列
        if 'group-column' in self._select_settings:
            self._group_column = self._select_settings['group-column']
        if 'group-column-min-value' in self._select_settings:
            self._group_column_min_value = self._select_settings['group-column-min-value']
        if 'group-column-max-value' in self._select_settings:
            self._group_column_max_value = self._select_settings['group-column-max-value']
        # 数值列 / 匹配列
        self._value_column = self._select_settings['value-column']


class DataMatchSelectSettings(BaseSelectSettings):
    def __init__(self, select_settings_json, input_file_map) -> None:
        super().__init__(select_settings_json, input_file_map)
        self._match_condition = self._select_settings['match-condition']


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
