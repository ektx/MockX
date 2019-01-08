// 用于保存所有的 mock 方法
import { ipcMain } from 'electron'
import Datastore from 'nedb'
import path from 'path'
import os from 'os'

let db = new Datastore({
    filename: path.join(os.homedir(), 'mock-x/db/mocks.db'),
    autoload: true,
    timestampData: true
})

/**
 * arg
 * @param {string} projectID 项目的baseUrl
 * @param {string} apiID API的_id
 * @param {string} method 类型，header params response
 * @param {boolean} used 使用中
 * @param {string} name 名称
 * @param {string} type 类型，json js txt
 * @param {string} json 如果是 js 或 json 我们默认生成 json 方便下次调用
 * @param {string} data 具体的模拟内容
 */
ipcMain.on('ADD_NEW_MOCK', (evt, arg) => {
    console.log('ADD_NEW_MOCK', arg)
    db.insert(
        {   
            projectID: arg.projectID,
            apiID: arg.apiID,
            method: arg.method,
            used: false,
            name: arg.name,
            type: arg.type,
            data: arg.data,
            json: arg.json
        },
        (err, doc)=> {
            if (err) {
                evt.sender.send('ADD_NEW_MOCK_RESULT', {
                    success: false,
                    message: '保存出错',
                    data: err
                })
                return
            }

            evt.sender.send('ADD_NEW_MOCK_RESULT', {
                success: true,
                data: doc
            })
        }
    )
})

ipcMain.on('GET_API_MOCKS', (evt, arg) => {
    // 查找此 api 的 id 的所有 mock
    db.find({apiID: arg.apiID}, (err, docs) => {
        if (err) {
            evt.sender.send('GET_API_MOCKS_RESULT', {
                success: false,
                message: '未知错误',
                data: err
            })
            return
        }

        evt.sender.send('GET_API_MOCKS_RESULT', {
            success: true,
            data: docs
        })
    })
})

/**
 * arg
 * @param {string} id mock的_id
 */
ipcMain.on('UPDATE_API_MOCK', async (evt, arg) => {
    try {
        // arg 内的内容是你要更新的内容
        await update(arg._id, arg)
        evt.sender.send('UPDATE_API_MOCK_RESULT', {
            success: true,
            message: '更新成功'
        })
    } catch (err) {
        evt.sender.send('UPDATE_API_MOCK_RESULT', {
            success: false,
            message: err
        })
    }
})

ipcMain.on('DELETE_MOCK', async (evt, arg) => {
    try {
        let data = await deletes(arg, false)
        console.log(data)

        evt.sender.send('DELETE_MOCK_RESULT', {
            success: true,
            message: data
        })
    } catch (err) {
        evt.sender.send('DELETE_MOCK_RESULT', {
            success: false,
            message: err
        })
    }
})

// 获取正在使用的 mock
function getMockJSON (id) {
    return new Promise((resolve, reject) => {
        db.findOne(
            {apiID: id, used: true},
            (err, doc) => {
                if (err) {reject(err); return}

                resolve(doc)
            }
        )
    })
}

function update (id, data, upsert = false) {
    console.log('UPDATE', id, data, upsert)
    return new Promise((resolve, reject) => {
        // 1. 查寻是否有此 mock 数据
        db.findOne(
            {_id: id},
            // 过滤查寻的结果中字段
            {_id: 0, createdAt: 0, updatedAt: 0, apiID: 0},
            (err, doc) => {
                if (err) {
                    reject(err)
                    return
                }

                if (doc) {
                    // 对查寻到的结果进行值的更新
                    for (let key in doc) {
                        if (key in data) {
                            doc[key] = data[key]
                        }
                    }

                    // 更新数据
                    db.update(
                        {_id: id},
                        {$set: doc},
                        {upsert},
                        (err, num) => {
                            if (err) {
                                reject(err)
                                return
                            }

                            console.log('UPDATE SUCCESS')
                            resolve(num)
                        }
                    )
                } else {
                    reject('没有数据')
                }
            }
        )       
    })
}

function deletes (query, multi = false) {
    console.log('Delete Mock:', query)
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

export {
    getMockJSON,
    deletes
}