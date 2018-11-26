import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/apis.db'),
    autoload: true
})

ipcMain.on('SAVE_API', (evt, arg) => {
    console.log(arg)
    db.findOne({projectId: arg.projectId, url: arg.url}, (err, doc) => {
        if (err) return

        if (doc) {
            evt.sender.send('SAVE_API_RESULT', {
                success: false,
                message: '此 API 已经存在'
            })
        } else {
            Object.assign(arg, {
                ctime: new Date
            })
            
            db.insert(arg, (err, docs) => {
                if (err) return
        
                evt.sender.send('SAVE_API_RESULT', {
                    success: true,
                    message: '添加完成'
                })
            })
        }
    })
})

ipcMain.on('GET_ALL_APIS', (evt, arg) => {
    db.find({projectId: arg.id}).sort().exec((err, docs) => {
        if (err) return

        evt.sender.send('GET_ALL_APIS_RESULT', {
            success: true,
            data: docs
        })
    })
})