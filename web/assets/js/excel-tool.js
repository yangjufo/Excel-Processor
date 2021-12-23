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
    await eel.delete_file_path(elem.parentNode.getElementsByTagName("span")[0].value)
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
        let fileList = document.getElementById('upload-file-list')
        fileList.insertAdjacentHTML('beforeend', '<li><span id="full-file-path" style="padding-right: 20px;">'
            + ret[1] + '</span><a class="main-btn main-btn-2" onclick="deleteFilePath(this)">删除</a></li>')
        document.getElementById('upload-file-name').setAttribute("data-title", "点击添加或拖动到此处")
    }
}