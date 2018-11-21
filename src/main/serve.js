import { ipcMain } from 'electron'
import express from 'express'

const app = express()
let serve

app.get('/', (req, res) => {
    res.send('hello')
})

// 接受客户端启动服务器命令
ipcMain.on('start-serve', (evt, arg) => {
    serve = app.listen(arg.port, () => {
        // 响应用户启动服务器结果
        evt.sender.send('start-serve-result', true)
    })
})

// 接受客户端关闭服务器请求
ipcMain.on('stop-serve', (evt, arg) => {
    serve.close()
    // 响应关闭请求结果 
    evt.sender.send('stop-serve-result', false)
})