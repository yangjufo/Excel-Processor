async function reinitialize() {
    eel.re_initialize();
    let ret = await eel.get_output_path()();
    document.getElementById("output-file-path").value = ret[0]
    document.getElementById("output-sheet-name").value = ret[1]
}

function readFilePath(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = e => {
            let fileName = input.files[0].name;
            input.setAttribute("data-title", fileName);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function deleteFilePath(elem) {
    await eel.delete_file_path(elem.parentNode.getElementsByTagName("span")[0].value)()
    elem.parentNode.remove()
}

async function uploadFile() {
    let filePath = document.getElementById('upload-file-path').value;
    let fileName = document.getElementById('upload-file-name').value

    // Call into Python so we can access the file system
    let ret = await eel.upload_file(filePath, fileName)();
    if (!ret[0]) {
        alert(ret[1])
    } else {
        let uploadFileList = document.getElementById('upload-file-list')
        uploadFileList.insertAdjacentHTML('beforeend', '<li><span id="full-file-path" style="padding-right: 20px;">'
            + ret[1] + '</span><a class="main-btn main-btn-2" onclick="deleteFilePath(this)">删除</a></li>')
        document.getElementById('upload-file-name').setAttribute("data-title", "点击添加或拖动到此处")

        // add items to file selection
        let selectFileList = document.getElementsByClassName('select-file-path-list')
        for (let index = 0; index < selectFileList.length; ++index) {
            selectFileList[index].insertAdjacentHTML('beforeend', '<li onclick="updateSheetList(this)">' + ret[1] + '</li>')
        }
    }
}

async function updateSheetList(elem) {
    let fullFilePath = $(elem).text();
    let ret = await eel.get_sheet_list(fullFilePath)();
    if (!ret[0]) {
        alert(ret[1])
    }

    updateMenu($(elem).parent(), fullFilePath)

    // add items to sheet selection
    let selectSheetList = elem;
    while (!selectSheetList.classList.contains("task")) {
        selectSheetList = selectSheetList.parentElement;
    }
    selectSheetList = selectSheetList.getElementsByClassName("select-sheet-name-list")[0]
    selectSheetList.innerHTML = ""
    for (let index = 0; index < ret[1].length; ++index) {
        selectSheetList.insertAdjacentHTML("beforeend", '<li onclick="updateColumnList(this)">' + ret[1][index] + '</li>')
    }


    // csv has no sheet, so update column selection
    if (fullFilePath.endsWith(".csv")) {
        updateColumnList(elem)
    }
}

async function updateColumnList(elem) {
    let sheetName = $(elem).text()
    let task = elem;
    while (!task.classList.contains("task")) {
        task = task.parentElement;
    }
    let fullFilePath = task.getElementsByClassName("select-file-path")[0].textContent
    let ret = await eel.get_column_list(fullFilePath, sheetName)()
    if (!ret[0]) {
        alert(ret[1]);
    }

    updateMenu($(elem).parent(), sheetName)

    // add items to group and value column selection
    let groupColumnList = task.getElementsByClassName("group-column-list")[0]
    groupColumnList.innerHTML = ""
    let valueColumnList = task.getElementsByClassName("value-column-list")[0]
    valueColumnList.innerHTML = ""
    for (let index = 0; index < ret[1].length; ++index) {
        groupColumnList.insertAdjacentHTML("beforeend", '<li onclick="updateValueList(this)">' + ret[1][index] + '</li>')
        valueColumnList.insertAdjacentHTML("beforeend", '<li onclick="updateMenu($(this).parent(), $(this).text())">' + ret[1][index] + '</li>')
    }
}

async function updateValueList(elem) {
    let column = $(elem).text()
    let task = elem;
    while (!task.classList.contains("task")) {
        task = task.parentElement;
    }
    let fullFilePath = task.getElementsByClassName("select-file-path")[0].textContent
    let sheetName = task.getElementsByClassName("select-sheet-name")[0].textContent
    let ret = await eel.get_column_values(fullFilePath, sheetName, column)()
    if (!ret[0]) {
        alert(ret[1]);
    }
    updateMenu($(elem).parent(), column)

    // add items to min/max value selection
    let minValueList = task.getElementsByClassName("group-col-min-value-list")[0]
    minValueList.innerHTML = ""
    let maxValueList = task.getElementsByClassName("group-col-max-value-list")[0]
    maxValueList.innerHTML = ""
    for (let index = 0; index < ret[1].length; ++index) {
        minValueList.insertAdjacentHTML("beforeend", '<li onclick="updateMenu($(this).parent(), $(this).text())">' + ret[1][index] + '</li>')
        maxValueList.insertAdjacentHTML("afterbegin", '<li onclick="updateMenu($(this).parent(), $(this).text())">' + ret[1][index] + '</li>')
    }
}

function updateMenu(menu, content) {
    menu.parent().find(".dropdownbox").find($("p")).text(content);
    menu.parent().find(".dropdownbox").find($("p")).css("color", "#040404");
    menu.css("height", "0");
    menu.removeClass("showMenu");
}

$(".dropdownbox").click(function () {
    if ($(this).parent().find('.menu').hasClass("showMenu")) {
        $(this).parent().find('.menu').removeClass("showMenu");
        $(this).parent().find('.menu').css("height", "0");
        return
    }
    $(".menu").css("height", "0");
    $('.menu').removeClass("showMenu");
    $(this).parent().find('.menu').css("height", "auto");
    $(this).parent().find('.menu').toggleClass("showMenu");
});