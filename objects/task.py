

from objects.file import BaseFile
import json


class BaseSelectSettings():
    def __init__(self, select_settings, input_file_map) -> None:
        self.__select_settings = select_settings
        # input file
        self.file = input_file_map[self.__select_settings['file']]
        self.sheet = self.__select_settings['sheet']  # selected sheet
        # 分组列 / 筛选列
        self.group_column = self.__select_settings['group-column']
        # 数值列 / 匹配列
        self.value_column = self.__select_settings['value-column']
        self.group_column_min_value = self.__select_settings['group-column-min-value']
        self.group_column_max_value = self.__select_settings['group-column-max-value']


class DataMatchSelectSettings(BaseSelectSettings):
    def __init__(self, select_settings_json, input_file_map) -> None:
        super().__init__(select_settings_json, input_file_map)
        self.match_condition = self.__select_settings['match-condition']


class BaseTask():
    def __init__(self, task_settings) -> None:
        self.__task_settings = json.loads(task_settings)
        self.__selects = list()
        self.__output_path = self.__task_settings['output-file-path']
        self.__output_sheet = self.__task_settings['output-sheet-name']

    def run():
        pass


class SumTask():
    def __init__(self, task_settings, input_file_map) -> None:
        super().__init__(task_settings)
        for select_settings in self.__task_settings['selects']:
            self.__selects.append(BaseSelectSettings(
                select_settings, input_file_map))

    def run():
        pass


class DataMatchTask():
    def __init__(self, task_settings, input_file_map) -> None:
        super().__init__(task_settings)
        for select_settings in self.__task_settings['selects']:
            self.__selects.append(DataMatchSelectSettings(
                select_settings, input_file_map))

    def run():
        pass
