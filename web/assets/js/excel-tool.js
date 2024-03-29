var selectPlaceHolders = {
    '.select-file-options': "请选择文件",
    '.select-sheet-options': "请选择表",
    '.select-group-column-options': "请选择列",
    '.select-value-column-options': "请选择列",
    '.select-group-column-min-value-options': "请选择最小值，空白表示全部",
    '.select-group-column-max-value-options': "请选择最大值，空白表示全部",
    '.selected-match-condition': "请选择条件"
};

async function reInitialize() {
    await eel.re_initialize();
    await resetTaskSelection();
    let ret = await eel.get_next_output_path()();
    $('#task-output-file-path')[0].value = ret[0];
    $('#task-output-sheet-name')[0].value = ret[1];
}

$('#load-file-name').change(function () {
    if (this.files && this.files[0]) {
        this.setAttribute('data-title', this.files[0].name);
    }
});

$('#load-file-btn').click(async function () {
    // check file name is not empty
    // add file to backend
    let ret = await eel.load_file($('#load-file-path')[0].value, $('#load-file-name').attr('data-title'))();
    if (!ret[0]) { // error
        alert(ret[1]);
        return;
    }

    // reset display
    $('#load-file-name')[0].value = ''
    $('#load-file-name')[0].setAttribute('data-title', '点击添加或拖动到此处');

    // add file to loaded file list
    let uploadedFileDelButton = $(('<a>删除</a>')).addClass('delete-file-btn').addClass('main-btn').addClass('main-btn-2')[0];
    let uploadedFileElem = $(('<li></li>'))
        .append($('<span></span>').text(ret[1]))
        .append(uploadedFileDelButton)[0];
    $('#loaded-file-list').append(uploadedFileElem);

    // add delete event
    $('.delete-file-btn').click(deleteFile);

    // add file to file select options
    for (let selectFileOptions of $('.select-file-options')) {
        selectFileOptions.append($(('<li></li>')).text(ret[1]).addClass('select-file-option')[0]);
    }
    // add click event
    $('.select-file-option').click(updateSelectSheetOptions);
});

async function resetTaskSelection() {
    // clean display
    for (let selectFileOptions of $('.select-file-options')) {
        let all_files = await eel.get_all_files()();
        $(selectFileOptions).empty();
        for (let index = 0; index < all_files.length; ++index) {
            selectFileOptions.append($(('<li></li>')).text(all_files[index]).addClass('select-file-option')[0]);
        }
        resetMenu(selectFileOptions, selectPlaceHolders['.select-file-options'])
        // add click event
        $('.select-file-option').click(updateSelectSheetOptions);
    }
    for (let selectSheetOptions of $('.select-sheet-options')) {
        $(selectSheetOptions).empty();
        resetMenu(selectSheetOptions, selectPlaceHolders['.select-sheet-options'])
    }
    for (let selectGroupColumnOptions of $('.select-group-column-options')) {
        $(selectGroupColumnOptions).empty();
        resetMenu(selectGroupColumnOptions, selectPlaceHolders['.select-group-column-options'])
    }
    for (let selectValueColumnOptions of $('.select-value-column-options')) {
        $(selectValueColumnOptions).empty();
        resetMenu(selectValueColumnOptions, selectPlaceHolders['.select-value-column-options'])
    }
    for (let selectGroupColumnMinValueOptions of $('.select-group-column-min-value-options')) {
        $(selectGroupColumnMinValueOptions).empty();
        resetMenu(selectGroupColumnMinValueOptions, selectPlaceHolders['.select-group-column-min-value-options'])
    }
    for (let selectGroupColumnMaxValueOptions of $('.select-group-column-max-value-options')) {
        $(selectGroupColumnMaxValueOptions).empty();
        resetMenu(selectGroupColumnMaxValueOptions, selectPlaceHolders['.select-group-column-max-value-options'])
    }
    for (let selectMatchCondition of $('.selected-match-condition')) {
        $(selectMatchCondition).text(selectPlaceHolders['.selected-match-condition']).css("color", '#798795');
    }
}

async function deleteFile() {
    let absoluteFilePath = $(this).parent().find('span').text();
    // delete file in backend
    let deletedFiles = await eel.delete_file(absoluteFilePath)();
    await resetTaskSelection();
    // delete task lists
    let deleteTasks = []
    for (let singleTask of $('#added-task-list')[0].children) {
        if (deletedFiles.includes(singleTask.querySelector('.output-file-path').textContent
            + ':' + singleTask.querySelector('.output-sheet-name').textContent)) {
            deleteTasks.push(singleTask);
        }
    }
    for (let singleTask of deleteTasks) {
        $('#added-task-list')[0].removeChild(singleTask);
    }

    $(this).parent().remove();
}

function getElementByClassName(elem, className) {
    let curr = $(elem);
    while (!curr.hasClass(className)) {
        curr = curr.parent();
    }

    return curr;
}

function getTaskSelectPane(elem) {
    return getElementByClassName(elem, "task-select-pane");
}

async function updateSelectSheetOptions() {
    // get currently selected
    let absoluteFilePath = $(this).text();
    // get sheet names from backend
    let ret = await eel.get_sheet_names(absoluteFilePath)();
    if (!ret[0]) {
        alert(ret[1]);
        return;
    }

    // reset
    let taskSelectPane = getTaskSelectPane(this);
    resetSelectSheetOptions(taskSelectPane);

    // add sheet name to select sheet options
    selectSheetOptions = taskSelectPane.find('.select-sheet-options');
    for (let index = 0; index < ret[1].length; ++index) {
        selectSheetOptions.append($(('<li></li>')).text(ret[1][index]).addClass('select-sheet-option')[0]);
    }

    // add click event
    $('.select-sheet-option').click(updateSelectColumnOptions)

    // csv has no sheet, so update column selection
    if (absoluteFilePath.endsWith(".csv")) {
        updateSelectColumnOptionsWithSheet(this);
    }
}

function resetSelectSheetOptions(taskSelectPane) {
    selectSheetOptions = taskSelectPane.find('.select-sheet-options');
    selectSheetOptions.empty();
    resetMenu(selectSheetOptions, selectPlaceHolders['.select-sheet-options'])
    resetSelectColumnOptions(taskSelectPane);
}

function updateSelectColumnOptions() {
    updateSelectColumnOptionsWithSheet(this);
}

async function updateSelectColumnOptionsWithSheet(elem) {
    // get currently selected
    let taskSelectPane = getTaskSelectPane(elem);
    let sheetName = $(elem).text();
    let absoluteFilePath = taskSelectPane.find('.selected-file').text();

    // get headers from backend
    let ret = await eel.get_headers(absoluteFilePath, sheetName)();
    if (!ret[0]) {
        alert(ret[1]);
        return;
    }

    // reest
    resetSelectColumnOptions(taskSelectPane);

    // add items to group and value column selection
    let selectGroupColumnOptions = taskSelectPane.find('.select-group-column-options');
    let selectValueColumnOptions = taskSelectPane.find('.select-value-column-options');
    for (let index = 0; index < ret[1].length; ++index) {
        selectGroupColumnOptions.append($(('<li></li>')).text(ret[1][index]).addClass('select-group-column-option')[0]);
        selectValueColumnOptions.append($(('<li></li>')).text(ret[1][index]).addClass('select-value-column-option')[0]);
    }

    // add click event
    $('.select-group-column-option').click(updateSelectGroupColumnValueOptions);
}

function resetSelectColumnOptions(taskSelectPane) {
    let selectGroupColumnOptions = taskSelectPane.find('.select-group-column-options');
    let selectValueColumnOptions = taskSelectPane.find('.select-value-column-options');
    selectGroupColumnOptions.empty();
    selectValueColumnOptions.empty();
    resetMenu(selectGroupColumnOptions, selectPlaceHolders['.select-group-column-options']);
    resetMenu(selectValueColumnOptions, selectPlaceHolders['.select-value-column-options']);
    resetSelectGroupColumnValueOptions(taskSelectPane);
}

async function updateSelectGroupColumnValueOptions() {
    // get currently selected
    let taskSelectPane = getTaskSelectPane(this);
    let column = $(this).text()
    let absoluteFilePath = taskSelectPane.find('.selected-file')[0].textContent;
    let sheet = taskSelectPane.find('.selected-sheet')[0].textContent

    // get data from backend
    let ret = await eel.get_column_values(absoluteFilePath, sheet, column)()
    if (!ret[0]) {
        alert(ret[1]);
        return;
    }

    //reset
    resetSelectGroupColumnValueOptions(taskSelectPane);

    // add items to min/max value selection
    let selectGroupColumnMinValueOptions = taskSelectPane.find('.select-group-column-min-value-options');
    let selectGroupColumnMaxValueOptions = taskSelectPane.find('.select-group-column-max-value-options');
    for (let index = 0; index < ret[1].length; ++index) {
        selectGroupColumnMinValueOptions.append($(('<li></li>')).text(ret[1][index]).addClass('select-group-column-min-value-option')[0]);
        selectGroupColumnMaxValueOptions.prepend($(('<li></li>')).text(ret[1][index]).addClass('select-group-column-max-value-option')[0]);
    }
}

function resetSelectGroupColumnValueOptions(taskSelectPane) {
    let selectGroupColumnMinValueOptions = taskSelectPane.find('.select-group-column-min-value-options');
    let selectGroupColumnMaxValueOptions = taskSelectPane.find('.select-group-column-max-value-options');
    selectGroupColumnMinValueOptions.empty();
    selectGroupColumnMaxValueOptions.empty();
    resetMenu(selectGroupColumnMinValueOptions, selectPlaceHolders['.select-group-column-min-value-options']);
    resetMenu(selectGroupColumnMaxValueOptions, selectPlaceHolders['.select-group-column-max-value-options']);
}

function resetMenu(menu, content) {
    $(menu).parent().find('.dropdownbox').find($("p")).text(content).css("color", '#798795');
    $(menu).css("height", "0");
    $(menu).removeClass("showMenu");
}

$('.dropdownbox').click(function () {
    if ($(this).parent().find('.menu').hasClass("showMenu")) {
        $(this).parent().find('.menu').removeClass("showMenu");
        $(this).parent().find('.menu').css("height", "0");
        return;
    }
    $('.menu').css("height", "0");
    $('.menu').removeClass("showMenu");
    $(this).parent().find('.menu').css("height", "auto");
    $(this).parent().find('.menu').toggleClass("showMenu");
    $('.menu > li').click(function () {
        $(this).parent().parent().find('.dropdownbox').find($("p")).text($(this).text()).css("color", "#040404");
        $(this).parent().css("height", "0");
        $(this).parent().removeClass("showMenu");
    });
});

const taskAnimations = [
    ['<div class="task-icon"><img src="assets/images/task-1.png" alt="Icon"><div style="padding-top:30px"><a class="vertical-main-btn main-btn-2" id="delete-task-btn">删除</a></div></div>',
        ['<div class="shape shape-1"><img src="assets/images/shape/shape-1.svg" alt="shape"></div>',
            '<div class="shape shape-2"><img src="assets/images/shape/shape-2.svg" alt="shape"></div>']],
    ['<div class="task-icon"><img src="assets/images/task-2.png" alt="Icon"><div style="padding-top:30px"><a class="vertical-main-btn main-btn-2" id="delete-task-btn">删除</a></div></div>',
        ['<div class="shape shape-3"><img src="assets/images/shape/shape-3.svg" alt="shape"></div>']],
    ['<div class="task-icon"><img src="assets/images/task-3.png" alt="Icon"><div style="padding-top:30px"><a class="vertical-main-btn main-btn-2" id="delete-task-btn">删除</a></div></div>',
        ['<div class="shape shape-4"><img src="assets/images/shape/shape-4.svg" alt="shape"></div>',
            '<div class="shape shape-5"><img src="assets/images/shape/shape-5.svg" alt="shape"></div>']]
];

var currTaskAnimation = 0;

function addTaskSettingsSelect(taskType, taskSelect) {
    let taskSettingsSelect = {}
    let selectedFile = taskSelect.find('.selected-file').text();
    if (selectedFile != selectPlaceHolders['.select-file-options']) {
        taskSettingsSelect['file'] = selectedFile;
    } else {
        alert("请先选择文件！");
        return;
    }
    let selectedSheet = taskSelect.find('.selected-sheet').text();
    if (selectedSheet != selectPlaceHolders['.select-sheet-options']) {
        taskSettingsSelect['sheet'] = selectedSheet;
    } else if (!selectedFile.endsWith(".csv")) {
        alert("请先选择表！");
        return;
    }
    let selectedGroupColumn = taskSelect.find('.selected-group-column').text();
    if (selectedGroupColumn != selectPlaceHolders['.select-group-column-options']) {
        taskSettingsSelect['group-column'] = selectedGroupColumn;
        let selectedGroupColumnMinValue = taskSelect.find('.selected-group-column-min-value').text();
        if (selectedGroupColumnMinValue != selectPlaceHolders['.select-group-column-min-value-options']) {
            taskSettingsSelect['group-column-min-value'] = selectedGroupColumnMinValue;
        }
        let selectedGroupColumnMaxValue = taskSelect.find('.selected-group-column-max-value').text();
        if (selectedGroupColumnMaxValue != selectPlaceHolders['.select-group-column-max-value-options']) {
            taskSettingsSelect['group-column-max-value'] = selectedGroupColumnMaxValue;
        }
    }
    let selectedValueColumn = taskSelect.find('.selected-value-column').text();
    if (selectedValueColumn != selectPlaceHolders['.select-value-column-options']) {
        taskSettingsSelect['value-column'] = selectedValueColumn;
    } else {
        switch (taskType) {
            case 'sum':
                alert("请先选择数值列！");
                break;
            case 'data-match':
                alert("请先选择匹配列！");
                break;
            default:
                alert("请先选择列！");
                break;
        }
        return;
    }

    if (taskType == 'data-match') {
        let selectedMatchCondition = taskSelect.find('.selected-match-condition').text();
        if (selectedMatchCondition != selectPlaceHolders['.selected-match-condition']) {
            taskSettingsSelect['match-condition'] = selectedMatchCondition;
        } else {
            alert("请先选择匹配条件！");
            return;
        }
    }

    return taskSettingsSelect
}

$('#add-task-btn').click(async function () {
    let taskSelectPane = getElementByClassName(this, "task-select-content").find('.active');
    let taskType = $(taskSelectPane).attr('id')
    let taskTitle = "未知", taskSettings = { 'selects': [] };
    // task selects
    if (taskType == "task-sum") {
        taskTitle = "求和";
        taskSettings['task-type'] = "sum";
        let taskSettingsSelect = addTaskSettingsSelect(taskSettings['task-type'], $('#task-sum-select'));
        if (taskSettingsSelect == null) {
            return;
        }
        taskSettings['selects'].push(taskSettingsSelect);
    } else if (taskType == "task-data-match") {
        taskTitle = "数据匹配";
        taskSettings['task-type'] = "data-match";
        let taskSettingsSelect1 = addTaskSettingsSelect(taskSettings['task-type'], $('#task-data-match-select-1'));
        if (taskSettingsSelect1 == null) {
            return;
        }
        taskSettings['selects'].push(taskSettingsSelect1);
        let taskSettingsSelect2 = addTaskSettingsSelect(taskSettings['task-type'], $('#task-data-match-select-2'));
        if (taskSettingsSelect2 == null) {
            return;
        }
        taskSettings['selects'].push(taskSettingsSelect2);
        if (taskSettingsSelect1['match-condition'] == '无' && taskSettingsSelect2['match-condition'] == '无') {
            alert('至少有一个匹配条件必须为“有”！');
            return;
        }
    }

    // output path
    if (!$('#task-output-file-path')[0].value.trim().endsWith(".xlsx")) {
        alert("输出文件后缀名必须是[.xlsx]！");
        return;
    }
    taskSettings['output-file-path'] = $('#task-output-file-path')[0].value.trim();
    if ($('#task-output-sheet-name')[0].value.trim() == "") {
        alert("输出表名不能为空！");
        return;
    }
    taskSettings['output-sheet-name'] = $('#task-output-sheet-name')[0].value.trim();
    let ret = await eel.add_task(taskSettings)();
    if (!ret[0]) {
        alert(ret[1]);
        return;
    }

    let inputPaths = []
    for (let taskSettingsSelect of taskSettings['selects']) {
        inputPaths.push(taskSettingsSelect['file'])
    }
    let taskItem = $('<div class="single-task d-flex"></div>')
        .append($(taskAnimations[currTaskAnimation][0])) // task icon
        .append($('<div class="task-content media-body"></div>')
            .append($('<h4 class="task-title"></h4>').text(taskTitle)) // task title
            .append($('<p><span>输入： </span> ' + inputPaths.join(", ") + '</p>').addClass('text')) // input path
            .append($('<p><span>输出文件： </span> <span class="output-file-path">' + taskSettings['output-file-path'] + '</span></p>').addClass('text')) // output path
            .append($('<p><span>输出表： </span> <span class="output-sheet-name">' + taskSettings['output-sheet-name'] + '</span></p>').addClass('text'))); // output sheet

    // add shape
    for (let shape of taskAnimations[currTaskAnimation][1]) {
        taskItem.append($(shape))
    }

    $('#added-task-list').append($('<div class="col-lg-4 col-md-7"></div>').append(taskItem))
    $('#delete-task-btn').click(deleteTask)

    currTaskAnimation = (currTaskAnimation + 1) % (taskAnimations.length)
});

async function deleteTask() {
    let taskItem = this;
    while (!taskItem.classList.contains('single-task')) {
        taskItem = taskItem.parentNode;
    }
    await eel.delete_task(taskItem.querySelector('.output-file-path').textContent,
        taskItem.querySelector('.output-sheet-name').textContent);
    $('#added-task-list')[0].removeChild(taskItem.parentNode);
}

$('#run-task-btn').click(async function () {
    let addedTaskList = $('#added-task-list')[0].innerHTML
    $('#added-task-list')[0].innerHTML = ''
    $('#added-task-list').append($('<div class="title" style="padding: 100px"><h4>正在执行任务，请耐心等待。。。</h4></div>'));
    let ret = await eel.run_all_tasks()();
    alert(ret[1]);
    if (!ret[0]) {
        $('#added-task-list')[0].innerHTML = addedTaskList;
        return;
    }
    $('#added-task-list')[0].innerHTML = '';
});