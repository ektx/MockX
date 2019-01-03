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
 * @param {string} id API的_id
 * @param {string} method 类型，header params response
 * @param {boolean} used 使用中
 * @param {string} name 名称
 * @param {string} type 类型，json js txt
 * @param {string} json 如果是 js 或 json 我们默认生成 json 方便下次调用
 * @param {string} data 具体的模拟内容
 */
ipcMain.on('ADD_NEW_MOCK', (evt, arg) => {
    console.log(arg)
    db.insert(
        {
            id: arg.id,
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
    db.find({id: arg.id}, (err, docs) => {
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
 * @param {string} api api的_id
 */
ipcMain.on('UPDATE_API_MOCK', async (evt, arg) => {
    try {
        await update(arg.id, arg)

        // db.find(
        //     {id: arg.api, used: true},
        //     (err, docs) => {
        //          let result = docs.map(item => {
        //             if (item._id !== arg.id) {
        //                 return item
        //             } return null
        //         })
        //         console.log(docs, result)
        //     }
        // )
    } catch (err) {
        evt.sender.send('UPDATE_API_MOCK_RESULT', {
            success: false,
            message: err
        })
    }
})

function getMockJSON (id) {
    return new Promise((resolve, reject) => {
        db.findOne(
            {id, used: true},
            (err, doc) => {
                console.log('mock', doc)
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
            {_id: 0, createdAt: 0, updatedAt: 0, id: 0},
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

export {
    getMockJSON
}