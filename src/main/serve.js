import { ipcMain } from 'electron'
import express from 'express'
import bodyParser from 'body-parser'
import project from './project.js'
import apis from './apis.js'

const app = express()

let serve

app.use(bodyParser.urlencoded({
    extended: true, 
    limit: '50mb'
}))

app.get('/:baseUrl/*',  apis.getData)

// 接受客户端启动服务器命令
ipcMain.on('START_SERVE', (evt, arg) => {
    serve = app.listen(arg.port, () => {
        // 响应用户启动服务器结果
        evt.sender.send('START_SERVE_RESULT', true)
    })
})

// 接受客户端关闭服务器请求
ipcMain.on('STOP_SERVE', (evt, arg) => {
    serve.close()
    // 响应关闭请求结果 
    evt.sender.send('STOP_SERVE_RESULT', false)
})

ipcMain.on('GET_PROJECTS', project.getProjects)
