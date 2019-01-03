<template>
 <el-dialog
    :title="title"
    :visible.sync="visible"
    :width="width"
    :height="height"
    class="preview-mock-com"
>   
    <aceCode v-model="code" :options="options"/>
</el-dialog>   
</template>

<script>
import mock from '../../../common/mocks/index.js'

export default {
    name: 'preview-mock',
    props: {
        title: {
            style: String,
            default: '预览'
        },
        show: {
            style: Boolean,
            default: false
        },
        width: {
            type: [String],
            default: '90%'
        },
        height: {
            type: [String],
            default: '100%'
        },
        value: {
            type: [String, Object],
            default: ''
        },
        options: {
            type: Object,
            default: () => ({
                readOnly: true,
                mode: 'javascript'
            })
        }
    },
    data () {
        return {
            visible: false,
            code: ''
        }
    },
    watch: {
        show (val) {
            this.visible = val
        },
        visible (val) {
            this.$emit('update:show', val)
        },
        value (val) {
            this.$nextTick(() => {
                // 对于对象，我们使用mock来生成模拟数据
                // 其它内容直接展示 
                this.code = typeof val === 'object' 
                ? JSON.stringify(mock(val), '', '\t') 
                : val
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.preview-mock-com /deep/ .el-dialog__body {
    height: 60vh;
}
</style>
