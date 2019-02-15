<template>
    <section class="ace-code-mod"></section>
</template>

<script>
import 'ace-builds'
import 'ace-builds/webpack-resolver'

export default {
    name: 'ace-code',
    props: {
        options: {
            type: Object,
            default: () => {}
        },
        value: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            editor: null,
            // 编辑状态
            myStatus: null,
            // https://github.com/ajaxorg/ace/wiki/Configuring-Ace#editor-options
            myOptions: {
                mode: 'ace/mode/text',
                theme: 'ace/theme/dracula',
                fontSize: 13,
                printMargin: false,
                useWorker: true,
                // 只读
                // readOnly: false,
                // 显示行数
                // showLineNumbers: true,
                // 显示提示区
                // showGutter: true
            }
        }
    },
    watch: {
        myOptions: {
            handler (val) {
                if (!val.mode.startsWith('ace')) {
                    val.mode = `ace/mode/${val.mode}`
                }

                if (!val.theme.startsWith('ace')) {
                    val.theme = `ace/theme/${val.theme}`
                }

                this.editor.setOptions(val)
            },
            deep: true
        },
        value: {
            handler (val) {
                // console.log(val, this.myStatus, 'ace')
                // 如果不是编辑状态，可以设置内容
                if (this.myStatus !== 'edit') {
                    this.$nextTick(() => {
                        this.editor.session.setValue(val)
                    })
                }
            },
            immediate: true
        }
    },
    mounted () {
        this.myOptions = Object.assign({}, this.myOptions, this.options)

        this.editor = ace.edit(this.$el)

        this.editor.session.on('change', delta => {
            // 如果当前选中中
            if (this.editor.isFocused()) {
                // 状态 编辑中
                this.myStatus = 'edit'
                this.$emit('input', this.editor.getValue())
            }
        })

        // 编辑器失去焦点时
        this.editor.on('blur', () => {
            // 设置状态为空
            this.myStatus = null
        })
        this.editor.on('focus', () => {
            // 设置状态为空
            this.myStatus = 'edit'
        })
        
    }
}
</script>

<style lang="scss">
.ace-code-mod {
    height: 100%;
}
</style>
