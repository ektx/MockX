import number from './number.js'

/**
 * 国际字冠+国家代码+地区代码(区号)+电话号码
 * International prefix + country code + area code (area code) + phone number
 * @param {objetc} obj 
 * @param {boolean|string} int 国际字冠
 * @param {boolean|string} country 国家代码
 * @param {boolean} privacy 安全，区号是否为加 ****
 */
export default function (obj) {
    let result = ''
    let opts = {
        // International 国际字冠 默认无
        // true => +,可以添加,如：'00'
        int: false,
        // 国家代码 true 时为自动添加本地
        country: false,
        // 手机号模糊处理
        privacy: false
    }

    opts = Object.assign(opts, obj)

    if (opts.int) {
        if (typeof opts.int === 'boolean') {
            result = '+'
        } else {
            result = ''+opts.int
        }
    }

    if (opts.country) {
        if (typeof opts.country === 'boolean') {
            result += defaultCountryCode[navigator.language]
        } else {
            if (defaultCountryCode.hasOwnProperty(opts.country)) {
                result += defaultCountryCode[opts.country]
            } else {
                result += defaultCountryCode[navigator.language]
            }
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

// 国际电话区号：http://www.renrencall.com/rebtel-sign-up/international-call-format/
//各国语言缩写：https://www.jianshu.com/p/99acd1bad729
const defaultCountryCode = {
    // 中国大陆
    'zh-CN': '86',
    // 阿尔巴尼亚
    'sq': '355',
    // 美国
    'en-US': '1',
    // 英国
    'en': '44',
    // 法国
    'fr': '33',
    // 日本
    'ja': '81',
    // 韩国
    'ko': '82',
    // 俄罗斯
    'be': '7',
    // 泰国
    'th': '66',
    // 加拿大
    'en-CA': '1'
}