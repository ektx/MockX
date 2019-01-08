import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/projects.db'),
    autoload: true,
    timestampData: true
})

// 设置项目名称为索引与唯一性
db.ensureIndex({
    fieldName: 'name',
    unique: true
}, err => {
    // console.log('Project db ensureIndex:', err)
})

/**
 * 查寻所有的项目
 * @param {event} evt ipcMain事件
 * @param {arguments} arg 参数
 */
function getProjects (evt, arg) {
    db.find({}).sort({createdAt: -1}).exec((err, docs) => {
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
    let data = {
        // 名称
        name: '',
        // 线上地址
        online: '',
        // 简介
        description: '',
        // 项目编号
        baseUrl: `project${+ new Date}`
    }

    // 只存在以上的内容
    for (let key in data) {
        if (Reflect.has(arg, key)) {
            data[key] = arg[key]
        }
    }

    db.insert(data, (err, docs)=> {
        if (err) {
            if (err.errorType === 'uniqueViolated') {
                err = '此项目已经存在'
            }

            evt.sender.send('GET_PROJECTS_RESULT', {
                success: false,
                message: err
            })
            return
        }
        
        // 发送所有项目
        getProjects(evt)
    })
})

//响应搜索事件
ipcMain.on('SEARCH_PROJECTS',(evt, arg) => {

    db.find(
        {name: { $regex: new RegExp(arg, 'i') }}
    ).sort({ctime: -1}).exec((err, docs) => {
        if (err) return

        evt.sender.send('SEARCH_PROJECTS_RESULT', {
            success: true,
            data: docs
        })
    })
    
})

// 响应删除事件
ipcMain.on('REMOVE_PROJECT',(evt, arg) => {
    db.remove(
        {_id: arg._id }, 
        {}, 
        (err, numRemoved) => {
            if (err) {
                evt.sender.send('REMOVE_PROJECT_RESULT', {
                    success: false,
                    data: err
                })
                return
            }

            // 删除apis

            // 删除 mocks

            evt.sender.send('REMOVE_PROJECT_RESULT', {
                success: true,
                data: numRemoved
            })
        }
    ) 
})

//响应修改事件
ipcMain.on('UPDATE_PROJECT',(evt, arg) => {
    db.update(
        { _id: arg._id }, 
        { $set: { 
            name: arg.name, 
            description: arg.description,
            online: arg.online
        } }, 
        {}, 
        (err, numReplaced) => {
            let data = err || numReplaced
            let success = err || true

            evt.sender.send('UPDATE_PROJECT_RESULT', {
                success,
                data
            }
        )
    });

})


