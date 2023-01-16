[中文](https://github.com/yangjufo/Excel-Processor/blob/main/README-ZH.md)
# A CSV / EXCEL Files Processing Tool
A simple CSV/EXCEL files processing tool, which supports computing sum and match data.

## Demo
* The following content uses CSV files as an example.
* Check out the video below for EXCEL file examples.[![image video](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/xlsx/recording/EXCEL_video_cover.png)](https://youtu.be/liUIVDElbII)

### Input data
#### biostats_1
<img src="https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/biostats_1.png" height="300">

#### biostats_2
<img src="https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/biostats_2.png" height="300">

#### Load files
![load files](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/load-files.png)

### Sum
Compute sum for a column. Support filtering on a column.

#### Add a sum task
![add a sum task](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/add-sum-task.png)

#### Results
![sum task results](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/sum-results.png)

### Data Match
Match data between two files based on a column. Users can filter on a column to rule out uninteresting rows.

 Based on match condition selections, Possible combinations include:

| File 1 should have the value | File 2 should have the value | Output Row                |
| ---------------------------- | ---------------------------- | ------------------------- |
| YES                          | YES                          | All columns in both files |
| YES                          | NO                           | File 1 columns            |
| NO                           | YES                          | File 2 columns            |
| NO                           | NO                           | Empty (invalid inputs)    |

#### Add a data match task
![add a data match task](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/add-data-match-task.png)

#### Results
![data match task results](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/data-match-results.png)


### Undo
#### Delete a file
Click the button next to the file name. All tasks that use the file as an input will also be deleted.

#### Delete a task
Click the button next to the task.
![delete a task](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/added-tasks.png)