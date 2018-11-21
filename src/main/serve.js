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
        evt.sender.send('start-serve-result', true)
    })
})

ipcMain.on('stop-serve', (evt, arg) => {
    serve.close()
    evt.sender.send('stop-serve-result', false)
})