
export default function image (options) {

    let defaultOption = {
        width: 100,
        height: 80,
        text: '',
        bgColor: '06f',
        textColor: 'fff'
    }

    options = Object.assign({}, defaultOption, options)

    options.text = options.text.replace(/\s+/, '+')

    return `https://dummyimage.com/${options.width}x${options.height}/${options.bgColor}/${options.textColor}.png&text=${options.text}`
    
}