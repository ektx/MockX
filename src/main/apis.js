import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'
import mock from '../common/mocks/index.js'

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
        mockType: ['Js', 'JSON', 'txt']
            Js 与 json 都会为你mock数据
            txt 直接返回内容
        json 生成数据使用
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
    db.find({projectId: arg.id}).sort({updatedAt: -1}).exec((err, docs) => {
        if (err) return

        evt.sender.send('GET_ALL_APIS_RESULT', {
            success: true,
            data: docs
        })
    })
})


function getData (req, res) {
    let query = Object.assign({}, {
        url: req.params[0],
        baseUrl: req.params.baseUrl
    })

    db.findOne(query, (err, doc) => {
        let data = `This API Not Find!`

        if (err) {
            res.send({
                success: false,
                message: err
            })
            return
        }

        if (doc) {
            data = doc.mockType === 'txt' ? 
                doc.json : mock(doc.json) 
        } 

        res.send(data)
    })
}


export default {
    getData
}