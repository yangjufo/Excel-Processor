import pandas as pd
from openpyxl import load_workbook
from datetime import datetime

# file class

class BaseFile():
    def __init__(self, path) -> None:
        self.path = path
        self.sheet_names = list()
        self.headers = list()
        self.column_values_map = dict()

    def get_sheet_names(self):
        return [True, []]

    # read headers from child class
    def read_headers(self, sheet_name):
        return None

    def get_headers(self, sheet_name):
        if len(self.headers) == 0:
            headers_frame = self.read_headers(sheet_name)
            index = 0
            for c in headers_frame.values.tolist()[0]:
                self.headers.append(str(index) + " " + str(c))
                index += 1
        return [True, self.headers]

    # read column values from child class
    def read_column_values(self, sheet_name, column_index):
        return None

    def get_column_values(self, sheet_name, column_index):
        if column_index not in self.column_values_map:
            column_values_frame = self.read_column_values(sheet_name, column_index)
            cols = set()
            for c in column_values_frame.values.tolist():
                if isinstance(c[0], datetime):
                    cols.add(c[0].strftime('%Y-%m-%d'))
                else:
                    cols.add(str(c[0]))
            self.column_values_map[column_index] = sorted(cols)
        return [True, self.column_values_map[column_index]]


# CSV file
class CsvFile(BaseFile):
    def __init__(self, path) -> None:
        super().__init__(path)

    def read_headers(self, sheet_name):
        return pd.read_csv(self.path, nrows=1, header=None)

    def read_column_values(self, sheet_name, column_index):
        return pd.read_csv(self.path, usecols=[column_index])

# XLS, XLSX file
class XlsFile(BaseFile):
    def __init__(self, path) -> None:
        super().__init__(path)

    def get_sheet_names(self):
        if len(self.sheet_names) == 0:
            self.sheet_names = load_workbook(self.path, read_only=True).sheetnames
        return [True, self.sheet_names]

    def read_headers(self, sheet_name):
        return pd.read_excel(
            self.path, sheet_name=sheet_name, nrows=1, header=None)

    def read_column_values(self, sheet_name, column_index):
        return pd.read_excel(
            self.path, sheet_name=sheet_name, header=None, usecols=[column_index])