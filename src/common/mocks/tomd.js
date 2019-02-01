import object from './core/object.js'
import base from './core/base.js';
const myHeader = {
    label: {
        label: '参数',
        align: ''
    },
    type: {
        label: '类型',
        align: ''
    },
    mark: {
        label: '说明',
        align: ''
    },
    preset: {
        label: '默认值',
        align: ''
    }
}

/**
 * 生成API文档
 * @param {object} opt 配置
 * @param {string} title opt中自定义标题，默认为 API
 * @param {object} header opt中自定义头部规则，默认为 myHeader
 * @param {object} data opt中的模拟数据
 * @param {boolean} preview 设置是否需要预览数据
 */
export default function (opt) {
    let mdHeader = opt.header || myHeader
    let title = opt.title
    let doc = []
    let art = []

    getDocs(doc, opt.data, 1, title)

    doc.forEach(item => {
        art.push({
            doc:  getDocBody(item.data, mdHeader),
            ...item
        })
    })
    let docHeader = generateDocHeader(mdHeader)
    let docTxt = generateMardDown(art, docHeader)

    if (opt.preview) {
        docTxt += `\n~~~json\n${JSON.stringify(object(opt.data), '', '\t')}\n~~~`
    }

    return docTxt
}

/**
 * 生成文档标题
 * @param {object} data 标题内容
 */
function generateDocHeader (data) {
    let header = ''
    let align = ''

    for (let key in data) {
        let item = data[key]

        header += `| ${item.label} `

        switch (item.align) {
            case 'left': align += `|:--`; break;
            case 'right': align += `|--:`; break;
            case 'center': align += `|:--:`; break;
            default: align += `|---`; break;
        }
    }

    return `${header} |\r\n${align}|\n`
}

/**
 * 生成文档树
 * @param {array} doc 空文档
 * @param {object} data 模拟数据
 * @param {number} level 级数,用于生成标题 
 * @param {string} title 标题说明 
 */
function getDocs (doc, data, level = 1, title = 'API') {
    let _data = data.data
    let _doc = {
        title,
        level,
        data: _data,
    }
    
    doc.push(_doc)

    for (let key in _data) {
        if (_data[key].type === 'object') {
            getDocs(doc, _data[key], level +1, key)
        } 
        // 对于数组，我们只处理数组的对象，其它内容不新建文档
        else if (_data[key].type === 'array') {
            if (typeof _data[key].data === 'object') {
                if (Array.isArray(_data[key].data)) {
                    let _obj = {}
                    _data[key].data.forEach((val, i) => {
                        // 只处理对象
                        if (base.typeof(val) === 'object') {
                            _obj[`param${i}`] = val
                        }
                    })

                    // 存在有效内容时，显示文本
                    if (Object.keys(_obj).length)
                        getDocs(doc, {data: _obj}, level+1, `${key}`)
                } else {
                    if (
                        Reflect.has(_data[key].data, 'type') 
                        && _data[key].data.type === 'object'
                    ) {
                        getDocs(doc, _data[key].data, level+1, `${key}`)
                    }
                }
            }
        }
    }
}

/**
 * 按标题的格式，生成文档的数组对象
 * @param {object} data 数据内容
 * @param {object} header 标题格式
 */
function getDocBody (data, header) {
    let result = []
    // 对所有的数据进行处理
    // 生成对应的文档数组
    for (let key in data) {
        let tem = {}

        for (let hKey in header) {
            switch (hKey) {
                case 'label':
                    tem[hKey] = `**${key}**`;
                    break;
                case 'type':
                    tem[hKey] = `\`${data[key].type}\``;
                    break;
                default:
                    tem[hKey] = data[key][hKey] || ''
            }
        }
        result.push(tem)
    }

    return result
}

/**
 * 生成文档
 * @param {array} docs 文档数组
 * @param {string} header 统一的文档头
 */
function generateMardDown (docs, header) {
    let result = ''

    // 处理多个文档
    docs.forEach(item => {
        let doc = ''
        let title = `${'#'.repeat(item.level)} ${item.title}` 

        item.doc.map(li => {
            let str = Object.values(li).reduce((a, b) => {
                return `${a} | ${b}`
            })

            doc += `| ${str} |\n`
        })
        
        // 合并文档标题与内容
        result += `${title}\n${header + doc}\n`
    })
    return result
}
