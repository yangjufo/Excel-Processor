import eel, os, random

eel.init('web')

@eel.expose
def get_file_path(folder, file):
    file = file.split('\\')[-1]
    if not os.path.exists(os.path.join(folder, file)):
        return [False, os.path.join(folder, file) + '不存在']
    return [True, None]

eel.start('index.html', size=(320, 120))
