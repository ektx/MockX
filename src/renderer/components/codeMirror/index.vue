<template>
    <div class="v-code-moirror-box"></div>
</template>

<script>
import 'highlight.js/styles/atom-one-light.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/hint/show-hint.css'

import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/css/css'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/javascript-hint.js'

export default {
    name: 'VCodeMirror',
    props: {
        value: {
            style: String,
            default: ''
        },
        option: {
            style: Object
        }
    },
    data () {
        return {
            codeBox: '',
            myOption: {
                // 主题效果 https://codemirror.net/demo/theme.html#dracula
                theme: 'dracula',
                // 显示行数
                lineNumbers: true,
                // 显示当前行
                styleActiveLine: true,
                // 匹配括号
                matchBrackets: true,
                // tab 为4个空格
                tabSize: 4,
                // 缩进 4 空格
                indentUnit: 4,
                hintOptions: {
                    keys: ['name', 'sscore', 'birthDate2', '你好']
                }
            },
            filterKey: [' ', '-', ';', '[',']','{','}','>','(',')']
        }
    },
    watch: {
        value (val) {
            if (this.myOption.readOnly) {
                this.codeBox.setValue(val)
            }
        },
        option: {
            handler (val, old) {
                Object.assign(this.myOption, val)
            },
            deep: true
        }
    },	
    mounted () {
        Object.assign(this.myOption, this.option)
        this.codeBox = CodeMirror(this.$el, this.myOption)

        // 响应值
        this.codeBox.on('keyup', (instance, event)=> {
            this.$emit('input', instance.doc.getValue())
        })

        // 自动智能提示
        this.codeBox.on('inputRead', (editor, input)=> {
            if (this.filterKey.includes(input.text[0])) return

            CodeMirror.commands.autocomplete(editor, null, {
                completeSingle: false 
            })
        })
    },
    methods: {
        // 设置代码
        setValue (val) {
            this.$nextTick(() => {
                this.codeBox.setValue(val)
            })
        }
    }
}
</script>

<style lang="scss">
.v-code-moirror-box {
    height: 100%;

    .CodeMirror {
        height: 100%;
    
        pre {
            font-size: 13px;
            font-weight: bold;
        }
    }
}
</style>
