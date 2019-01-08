import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'
import mock from '../common/mocks/index.js'
import { getMockJSON, deletes as delMocks } from './mock.js'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/apis.db'),
    autoload: true,
    timestampData: true
})

db.ensureIndex({
    fieldName: 'id',
    unique: true
})

// 准备废弃
ipcMain.on('SAVE_API', (evt, arg) => {
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
        // 头部参数与内容
        headers: [],
        // 项目ID
        projectId: 'mZ6YvR6eYBp1yGeM',
    }
    */

    // 查寻当前项目是否已经有了此API
    db.findOne(
        {projectId: arg.projectId, url: arg.url}, 
        (err, doc) => {
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
        }
    )
})

/**
 * 添加 API 时，默认只要提供
 * @param {string} url 地址
 * @param {string} method 方法
 * @param {string} description 描述
 * @param {string} baseUrl 这是自带必填内容，用于表示所属项目
 * @returns 返回成功后_id或失败信息
 */
ipcMain.on('ADD_API', (evt, arg) => {
    // 验证传参
    let result = true
    let message = []
    let params = {
        url: '',
        method: 'get',
        description: '',
        baseUrl: ''
    }

    if (!arg.baseUrl) {
        result = false
        message.push('没有 baseUrl')
    }

    if (!result || !arg.url) {
        result = false
        message.push('没有 url')
    }

    if (!result) {
        evt.sender.send('ADD_API_RESULT', {
            success: false,
            message
        })
        return
    }

    // 赋值
    for (let key in params) {
        if (Reflect.has(arg, key)) {
            params[key] = arg[key].trim()
        }
    }

    params.id = params.baseUrl + params.url

    db.insert(params, (err, docs) => {
        if (err) {
            err = err.errorType === 'uniqueViolated' ? 'API 已经存在' : '出现未知错误'

            evt.sender.send('ADD_API_RESULT', {
                success: false,
                message: err
            })
            return
        }

        evt.sender.send('ADD_API_RESULT', {
            success: true,
            message: '添加成功',
            data: docs
        })
    })
  
})

/**
 * 通过 baseUrl 来查寻所有的 APIs
 */
ipcMain.on('GET_ALL_APIS', (evt, arg) => {
    db.find({baseUrl: arg.baseUrl}).sort({updatedAt: -1}).exec((err, docs) => {
        if (err) return

        evt.sender.send('GET_ALL_APIS_RESULT', {
            success: true,
            data: docs
        })
    })
})

/**
 * 更新 API 基础信息
 */
ipcMain.on('UPDATE_API', (evt, arg) => {
    db.update(
        {_id: arg._id},
        {$set: {
            // 更新简介
            description: arg.description,
            // 更新请求方式
            method: arg.method
        }},
        (err, numReplaced) => {
            let success = true
            if (err) success = false

            evt.sender.send('UPDATE_API_RESULT', {success})
        }
    )
})

// 响应删除api操作
ipcMain.on('REMOVE_API', (evt,arg) => {
    console.log('REMOVE_API:', arg)
    db.remove({_id: arg._id}, {}, async (err, numRemoved) => {
        if (err) {
            evt.sender.send('REMOVE_API_RESULT', {
                success: false,
                data: err
            })
            return
        }

        await delMocks({apiID: arg._id}, true)

        evt.sender.send('REMOVE_API_RESULT', {
            success: true,
            data: numRemoved
        })
    })
})

//响应搜索api操作
ipcMain.on('SEARCH_APIS', (evt, arg, arg2) => {

    db.find({ baseUrl: arg2, url: { $regex: new RegExp(arg) }}).sort({updatedAt: -1}).exec((err, docs) => {
        if (err) return

        evt.sender.send('SEARCH_APIS_RESULT', {
            success: true,
            data: docs
        })
    })

})

function deleteAPI (query, multi = false) {
    console.log('Delete API:', query)
    return new Promise((resolve, reject) => {
        db.remove(query, {multi}, (err, num) => {
            if (err) {
                reject(err)
                return
            }

            resolve(num)
        })
    })
}

// 查寻接口的数据
function getData (req, res) {
    let query = Object.assign({}, {
        // 请求 url 
        url: req.params[0],
        // 项目编号
        baseUrl: req.params.baseUrl
    })

    // 查寻对应的 api,项目中的url中唯一的
    db.findOne(query, async (err, doc) => {
        let data = `This API Not Find!`

        if (err) {
            res.send({
                success: false,
                message: err
            })
            return
        }
        // 查寻到了 api 基础信息后
        if (doc) {
            // 我们通过 api 的 _id 去 mocks数据库中取唯一一个
            // 使用中的 mock 
            // {apiID: doc._id, used: true}
            data = await getMockJSON(doc._id)

            if (data) {
                data = data.type === 'txt' ? data.json : mock(data.json) 
            } else {
                data = '没有发现使用中的数据'
            }

        } 

        res.send(data)
    })
}

function postData (req, res) {
    console.log(req.body)

    res.send('测试中...')
}


export {
    getData,
    postData,
    deleteAPI
}