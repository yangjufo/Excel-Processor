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
    };
}

async function deleteFile() {
    let absoluteFilePath = $(this).parent().find('span').text();
    // delete file in backend
    await eel.delete_file(absoluteFilePath)();
    await resetTaskSelection();
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
    resetMenu(selectSheetOptions, "请选择表")
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
    resetMenu(selectGroupColumnOptions, "请选择列");
    resetMenu(selectValueColumnOptions, "请选择列");
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
    resetMenu(selectGroupColumnMinValueOptions, "请选择列");
    resetMenu(selectGroupColumnMaxValueOptions, "请选择列");
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
    ['<div class="task-icon"><img src="assets/images/task-1.png" alt="Icon"></div>',
        ['<div class="shape shape-1"><img src="assets/images/shape/shape-1.svg" alt="shape"></div>',
            '<div class="shape shape-2"><img src="assets/images/shape/shape-2.svg" alt="shape"></div>']],
    ['<div class="task-icon"><img src="assets/images/task-2.png" alt="Icon"></div>',
        ['<div class="shape shape-3"><img src="assets/images/shape/shape-3.svg" alt="shape"></div>']],
    ['<div class="task-icon"><img src="assets/images/task-3.png" alt="Icon"></div>',
        ['<div class="shape shape-4"><img src="assets/images/shape/shape-4.svg" alt="shape"></div>',
            '<div class="shape shape-5"><img src="assets/images/shape/shape-5.svg" alt="shape"></div>']]
];

var currTaskAnimation = 0;

$('#add-task-btn').click(async function () {
    let taskSelectPane = getElementByClassName(this, "task-select-content").find('.active');
    let taskType = $(taskSelectPane).attr('id')
    let taskTitle = "未知", taskSettings = { 'selects': [] };
    // task selects
    if (taskType == "task-sum") {
        taskTitle = "求和";
        taskSettings['task-type'] = "sum";
        let taskSelectSettings = {}
    } else if (taskType == "task-data-match") {
        taskTitle = "数据匹配"
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

    let taskItem = $('<div class="single-task d-flex"></div>')
        .append($(taskAnimations[currTaskAnimation][0])) // task icon
        .append($('<div class="task-content media-body"></div>')
            .append($('<h4 class="task-title"></h4>').text(taskTitle)) // task title
            .append($('<p><span>输入： </span> ' + inputPaths + '</p>').addClass('text')) // input path
            .append($('<p><span>输出： </span> ' + outputPath + '</p>').addClass('text'))); // output path

    // add shape
    for (let shape of taskAnimations[currTaskAnimation][1]) {
        taskItem.append($(shape))
    }

    $('#added-task-list').append($('<div class="col-lg-4 col-md-7"></div>').append(taskItem))

    currTaskAnimation = (currTaskAnimation + 1) % (taskAnimations.length)
});