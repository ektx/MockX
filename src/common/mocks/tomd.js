const docs = {}
const MDheader = [
    ['name', 'type', 'mark', 'defVal'],
    ['---', '---', '---', ':---:']
]

export default function (data, label = '说明') {
    docs.main = {
        level: 1,
        label,
        data: data
    }

    let type = getType(data)

    init(type, docs.main)

    return generateMD(docs)
}

/**
 * 处理
 * @param {string} type 类型
 * @param {object} arg 数据内容
 * @param {object} parent 父级数据
 */
function init (type, arg, parent) {
    let data = arg

    if (parent) {
        // 如果有父级，为父级添加子级
        if (!Reflect.has(parent, 'children')) {
            parent.children = []
        }
        
        // 如果是对象
        if (type === 'object') {
            // 封装一层
            data = {
                level: parent.level +1,
                ...arg,
            }
        }
    }

    
    switch (type) {
        case 'array': arrayFun(data, parent); break;
        case 'object': objectFun(data, parent); break;
        default: 
            arg.doc = [...MDheader]
            arg.doc.push(
                ordinaryType({
                    ...arg.data,
                    name: arg.label,
                })
            )    
    }
}

/*
    {
        label: '标题',
        mark: '说明’,
        level: 1,
        // data 中是 mock 数组
        data: [{
            label: '标签',
            mark: '说明',
            defVal: '默认值',
            min: 1,
            max: 1,
            data: [ mock 方法]
        }]
    }
*/
function arrayFun (arg, parent) {
    arg.doc = [...MDheader]

    arg.data.forEach((item, index) => {
        let type = getType(item.data)
        let name = item.label || `参数 ${index+1}`

        // 处理单个元素
        arg.doc.push(ordinaryType({
            ...item,
            name,
            type
        }))

        // 处理复杂型数据
        if (['array', 'object'].includes(type)) {
            // 添加 labele
            item.label = name
    
            init(type, item, arg)
        }
    })

    // 保存处理数据
    if (parent) parent.children.push(arg)
}

function objectFun (arg, parent) {
    arg.doc = [...MDheader]

    for (let key in arg.data) {
        let type = getType(arg.data[key])
        
        arg.doc.push(ordinaryType({
            ...arg.data[key],
            type,
            name: key
        }))

        // 处理复杂型数据
        if (['array', 'object'].includes(type)) {
            init(type, {
                level: arg.level +1,
                label: key,
                data: arg.data[key]
            }, arg)
        }
    }
    
    if (parent) parent.children.push(arg)
}

// 处理通用型数据
function ordinaryType (arg) {
    return [
        `**${arg.name || '-'}**`,
        `\`${arg.type}\``,
        `${arg.mark || '-'}`,
        `${arg.defVal || '-'}`
    ]
}

// 获取参数的类型
function getType (arg) {
    return typeof arg.type === 'string' 
    ? arg.type 
    : Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
}

function generateMD (arg) {
    let mdDoc = ''

    for (let key in arg) {
        let data = arg[key]

        mdDoc += `${'#'.repeat(data.level)} ${data.label}\r\n`
        mdDoc += docToMD(data.doc) + '\r\n\r\n'

        if (data.children) {
            mdDoc += generateMD(data.children)
        }
    }

    return mdDoc
}

function docToMD (arr) {
    arr = arr.map(item => {
        item = item.reduce((a, b) => {
            return `${a} | ${b}`
        })

        return item = `| ${item} |`
    })

    let md = arr.reduce((a,b) => {
        return `${a}\r\n${b}`
    })

    return md
}