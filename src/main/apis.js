import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/apis.db'),
    autoload: true,
    timestampData: true
})

ipcMain.on('SAVE_API', (evt, arg) => {
    console.log(arg)
    /*
    { 
        // API url
        url: 'abc' 
        // 项目URL
        baseUrl: 'project1543286900089',
        // 简介
        description: '',
        // 请求方式
        method: 'get',
        // mock 数据
        mock: '{\n    a: 1\n}',
        // 
        params: [],
        // 项目ID
        projectId: 'mZ6YvR6eYBp1yGeM',
    }
    */

    // 查寻当前项目是否已经有了此API
    db.findOne({projectId: arg.projectId, url: arg.url}, (err, doc) => {
        if (err) return

        if (doc) {
            evt.sender.send('SAVE_API_RESULT', {
                success: false,
                message: '此 API 已经存在'
            })
        } else {
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


function getData (req, res) {
    console.log(req.body)
    console.log(req.params)

    db.findOne(req.params, (err, doc) => {
        console.log(doc)
        if (err) {
            res.send({
                success: false,
                message: err
            })
            return
        }

        res.send(doc)
    })
}


export default {
    getData
}