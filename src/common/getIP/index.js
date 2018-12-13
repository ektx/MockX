import os from 'os'
import macaddress from 'macaddress'
const ip = {}

let ips = os.networkInterfaces()

function init () {
    return new Promise((resolve, reject) => {
        macaddress.one((err, mac) => {
            if (err) {
                reject(err)
                return
            }

            doWithIP(mac)
    
            resolve(ip)
        })
    })
}

function doWithIP (mac) {
    for (let key in ips) {
        ips[key].forEach(item => {
            if (item.mac === mac) {
                ip[item.family] = item
            }
        })
    }
}

async function getIPv4 () {
    return (await init()).IPv4.address
}

async function getIPv6 () {
    return (await init()).IPv6.address
}

export {
    getIPv4,
    getIPv6
}