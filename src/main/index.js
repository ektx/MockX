import { app, BrowserWindow, session } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

app.on('ready', () => {
    let window = new BrowserWindow({
        width: 800
    })

    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))
    }

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

    
})