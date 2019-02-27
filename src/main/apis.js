/**
 * 添加 API 时，默认只要提供
 * @param {string} id 唯一，自动生成，用于保证不重复相同url
 * @param {string} url 地址
 * @param {post|get} method 方法
 * @param {string} description 描述
 * @param {string} baseUrl 这是自带必填内容，用于表示所属项目
 * @param {number} usedProxy 使用代理
 * @param {array} proxyList 代理列表
 * @param {date} updatedAt 更新时间
 * @param {date} createAt 创建时间
 * @param {array} params 请求参数
 * 
 * @param proxyList 参数
 * {
 *    @param {string} title 标题
 *    @param {string} url 地址
 *    @param {boolean} status 是否使用中
 * }
 * 
 * @param usedProxy 
 * {
 *  @param {boolean} open 开关
 *  @param {number} index 使用的代理
 * }
 * 
 * # 接口说明
 * GET_DATABASE_CONTENT 返回数据库操作得到的内容
 */
import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'
import http from 'http'
import https from 'https'
import querystring from 'querystring'
import url from 'url'
import mock from '@ektx/mocks'
import { getMockJSON, deletes as delMocks } from './mock.js'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/apis.db'),
    autoload: true,
    timestampData: true
})

// 设置url为索引并是唯一
db.ensureIndex({
    fieldName: 'id',
    unique: true
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

    if (!result || !arg.url || !arg.url.trim().length) {
        result = false
        message.push('没有 url')
    }

    if (!result) {
        evt.sender.send('ADD_API_RESULT', {
            success: false,
            message: message.join(' ')
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
    params.params = []

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
    db
    .find({baseUrl: arg.baseUrl})
    .sort({updatedAt: -1})
    .exec((err, docs) => {
        if (err) {
            evt.sender.send('GET_ALL_APIS_RESULT', {
                success: false,
                data: docs
            })
            return
        }

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
    db
    .find({ baseUrl: arg2, url: { $regex: new RegExp(arg) }})
    .sort({updatedAt: -1})
    .exec((err, docs) => {
        if (err) return

        evt.sender.send('SEARCH_APIS_RESULT', {
            success: true,
            data: docs
        })
    })

})

// 添加 params 参数
ipcMain.on('ADD_API_PARAMS', (evt, arg) => {
    db.update(
        {_id: arg.id},
        {
            $set: {
                params: arg.params
            }
        },
        {},
        (err, doc) => {
            console.log(err, doc)
        }
    )
})

ipcMain.on('API_DB_SET', function (evt, arg) {
    // console.log('API_DB_SET', arg)

    switch (arg.query) {
        case 'find':
            db
            .find( new Function(`return ${arg.params}`)() )
            .exec((err, docs) => {
                console.log(docs)
                if (err) {
                    evt.sender.send('GET_DATABASE_CONTENT', {
                        success: false,
                        data: err
                    }) 
                }

                evt.sender.send('GET_DATABASE_CONTENT', {
                    success: true,
                    data: docs
                })
            })
    }
})

ipcMain.on('API_ADD_NEW_PROXY', function (evt, arg) {
    db.update(
        {_id: arg._id},
        {
            $addToSet: {
                proxyList: {
                    title: arg.title,
                    url: arg.url,
                    used: false
                }
            }
        },
        {},
        (err, nums) => {
            if (err) {
                evt.sender.send('API_ADD_NEW_PROXY_RESULT', {
                    success: false,
                    data: err
                })
                return
            }

            evt.sender.send('API_ADD_NEW_PROXY_RESULT', {
                success: true,
                data: nums
            })
        }
    )
})

ipcMain.on('REMOVE_API_PROXY', function (evt, arg) {

    db.update(
        {_id: arg._id},
        {
            $pull: {
                proxyList: {
                    url: arg.url,
                    title: arg.title
                }
            }
        },
        {},
        (err, nums) => {
            if (err) {
                evt.sender.send('REMOVE_API_PROXY_RESULT', {
                    success: false,
                    data: err
                })
                return
            }

            evt.sender.send('REMOVE_API_PROXY_RESULT', {
                success: true,
                data: nums
            })
        }
    )
})

ipcMain.on('SET_API_USEDPROXY', function (evt, {_id, ...usedProxy}) {
    db.update(
        { _id },
        {
            $set: { usedProxy }
        },
        {},
        (err, nums) => {
            if (err) {
                evt.sender.send('SET_API_USEDPROXY_RESULT', {
                    success: false,
                    data: err
                })
                return
            }

            evt.sender.send('SET_API_USEDPROXY_RESULT', {
                success: true,
                data: nums
            })
        }

    )
})

function deleteAPI (query, multi = false) {
    // console.log('Delete API:', query)
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

            if (
                Reflect.has(doc, 'usedProxy') 
                && doc.usedProxy.open
            ) {
                let _url = doc.proxyList[doc.usedProxy.index].url
                let _urlObj = url.parse(_url)
                let _postData = ''
                let _path = _urlObj.path

                // 针对 req.query
                if (Object.keys(req.query).length) {
                    _path += `?${querystring.stringify(req.query)}`
                }

                // 针对 req.body
                if (Object.keys(req.body)) {
                    _postData = querystring.stringify(req.body)
                }

                let _options = {
                    hostname: _urlObj.hostname,
                    port: 443,
                    path: _path,
                    method: req.method,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'Content-Length': Buffer.byteLength(_postData)
                    }
                }

                // proxy ask
                let _request
                if (_urlObj.protocol === 'https:') {
                    _request = https.request(_options, (hres) => {
                        hres.setEncoding('utf8')
                        // 处理返回格式
                        res.setHeader('Content-Type', hres.headers['content-type'])

                        hres.pipe(res)
                    })
                } else {
                    _request = http.request(_options, (hres) => {
                        hres.pipe(res)
                    })
                }
                
                _request.write(_postData)
                _request.end()
                return
            }

            // 我们通过 api 的 _id 去 mocks数据库中取唯一一个
            // 使用中的 mock 
            // {apiID: doc._id, used: true}
            data = await getMockJSON(doc._id)

            if (data) {
                data = data.type === 'txt' ? data.json : mock(data.json) 
            } else {
                data = '没有发现使用中的数据'
            }

            res.send(data)
        } 
    })
}

function postData (req, res) {
    // console.log(req.params, req.query, req)

    // res.send('测试中...')
    getData(req, res)
}


export {
    getData,
    postData,
    deleteAPI
}