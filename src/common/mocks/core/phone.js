import number from './number.js'

export default function (opts) {
    let result = ''
    let defaultOpt = {
        // 手机号模糊处理
        privacy: false
    }

    opts = Object.assign(defaultOpt, opts)

    if (opts.int) {
        if (typeof opts.int === 'boolean') {
            result = '+'
        } else {
            result = ''+opts.int
        }
    }

    result += `1`+number({
        type: 'number',
        length: 2
    })

    if (opts.privacy) {
        result += '****' + number({
            type: 'number',
            length: 4
        })
    } else {
        result += number({
            type: 'number',
            length: 8
        })
    }

    return result
}
