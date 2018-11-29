<template>
    <div class="v-code-moirror-box"></div>
</template>

<script>
import 'highlight.js/styles/atom-one-light.css'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/css/css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'

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
                lineNumbers: true,
                tabSize: 4,
                indentUnit: 4
            }
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
                // for (let key in val) {
                //     if (val[key] != this.myOption[key]) {
                //         this.codeBox.setOption(key, val[key])
                //         this.myOption[key] = val[key]
                //     }
                // }
            },
            deep: true
        }
    },	
    mounted () {
        Object.assign(this.myOption, this.option)
        this.codeBox = CodeMirror(this.$el, this.myOption)

        this.codeBox.on('keyup', (instance, event)=> {
            this.$emit('input', instance.doc.getValue())
        })
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
