import http from 'http'
import qs from 'querystring'
import { ipcMain } from 'electron'



ipcMain.on('SEND_REQUEST', (evt, arg) => {
    
    var post_data,content;

    if (arg.type === 'POST') {
        post_data = arg.data;
        content = qs.stringify(post_data);
    }
    
    
    var options = {
        hostname: arg.url.split('//')[(arg.url.split('//')).length-1].split(':')[0],
        port: arg.url.split('//')[(arg.url.split('//')).length-1].split(':')[1].split('/')[0],
        path: '/'+arg.url.split('//')[(arg.url.split('//')).length-1].split('/').splice(1).join('/'),
        method: arg.type,
        headers: arg.headers
    };
      
    var req = http.request(options, function (res) {
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        
        res.setEncoding('utf8');
        let data = ''
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            data += chunk
        })
        .on('end', function() {
            evt.sender.send('SEND_REQUEST_RESULT', {
                success: true,
                data: {res, data}
            })
        })

    });  
      
    req.on('error', function (e) {  
        console.log('problem with request: ' + e.message); 

        evt.sender.send('SEND_REQUEST_RESULT', {
            success: false,
            data: e
        })

    });  
      
    if (arg.type === 'POST') {
        // 将数据写入请求体
        req.write(content);//注意这个地方
    }

    req.end();
   
})




