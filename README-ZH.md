# 一个CSV/EXCEL文件处理工具
支持求和以及数据匹配。

## 示例
* 以下内容以CSV为例。
* EXCEL的例子请查看下方视频。[![image video](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/xlsx/recording/EXCEL_video_cover.png)](https://youtu.be/liUIVDElbII)

### 输入数据
#### biostats_1
<img src="https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/biostats_1.png" height="300">

#### biostats_2
<img src="https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/biostats_2.png" height="300">

#### 加载文件
![load files](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/load-files.png)

### 求和
计算某一列的和，同时支持根据另一列分组求和。

#### 添加一个求和任务
![add a sum task](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/add-sum-task.png)

#### 运行结果
![sum task results](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/sum-results.png)

### 数据匹配
根据一列的数值，匹配两个文件中的行。同时每个文件支持在某一列上筛选，从而只包含有价值的行在结果中。

根据不同的匹配条件，可能的结果行如下:

| 文件1匹配列匹配条件 | 文件2匹配列匹配条件 | 输出行               |
| ------------------- | ------------------- | -------------------- |
| 有                  | 有                  | 文件1和文件2的所有列 |
| 有                  | 无                  | 文件1的所有列        |
| 无                  | 有                  | 文件2的所有列        |
| 无                  | 无                  | 空 （无效输入）      |

#### 添加一个数据匹配任务
![add a data match task](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/add-data-match-task.png)

#### 运行结果
![data match task results](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/data-match-results.png)


### 撤回操作
#### 删除一个文件
点击文件名旁的删除按钮。所有使用该文件作为输入的任务也会被删除。

#### Delete a task
点击任务旁的删除按钮。
![delete a task](https://raw.githubusercontent.com/yangjufo/Excel-Processor/main/testing/csv/screenshots/added-tasks.png)