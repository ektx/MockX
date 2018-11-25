import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/projects.db'),
    autoload: true
})

/**
 * 查寻所有的项目
 * @param {event} evt ipcMain事件
 * @param {arguments} arg 参数
 */
function getProjects (evt, arg) {
    db.find({}).sort({ctime: -1}).exec((err, docs) => {
        if (err) return

        evt.sender.send('GET_PROJECTS_RESULT', {
            success: true,
            data: docs
        })
    })
}

export default {
    getProjects
}

// 响应保存事件
ipcMain.on('SAVE_PROJECT', (evt, arg) => {
    let time = new Date
    db.findOne({name: arg.name}, (err, docs) => {
        console.log(1, err, docs)
        if (err) return

        if (docs) {
            evt.sender.send('GET_PROJECTS_RESULT', {
                success: false,
                message: '已经存在此项目'
            })
        } else {
            db.insert(Object.assign(arg, {
                ctime: time,
                baseUrl: `project${+ time}`
            }), (err, docs)=> {
                if (err) return
                
                // 发送所有项目
                getProjects(evt)
            })
        }
    })
})