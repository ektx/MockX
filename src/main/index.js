import { app, BrowserWindow, session } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'
import './serve.js'
import './postMan.js'

const isDevelopment = process.env.NODE_ENV !== 'production'

// 创建一个全局的窗口对象，方便我们对它进行管理
let win

function createWindow() {
    // 创建窗口
    win = new BrowserWindow({
        width: 800,
        minWidth: 500,
        minHeight: 300
    })

    // 判断开发与生产
    if (isDevelopment) {
        win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
        win.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))
    }

    // 打开开发者工具
    // win.webContents.openDevTools()

    // 监听窗口关闭
    win.on('closed', () => {
        win = null
    })

    //fixed: Launch throwing breaking devtools error
    // https://github.com/electron/electron/issues/13008#issuecomment-400261941
    session.defaultSession.webRequest.onBeforeRequest({}, (details, callback) => {
        if (details.url.indexOf('hack') !== -1) {
            callback({
                redirectURL: details.url.replace(
                    '7accc8730b0f99b5e7c0702ea89d1fa7c17bfe33',
                    '57c9d07b416b5a2ea23d28247300e4af36329bdc'
                )
            })
        } else {
            callback({ cancel: false })
        }
    })

}

// 当应用准备好后，我们开始调用窗口事件
app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
})
