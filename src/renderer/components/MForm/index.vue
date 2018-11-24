<template>
    <el-form :model="value" ref="form" label-width="100px" :rules="rules">
        <el-form-item 
            v-for="(item, index) in data" 
            :key="index" 
            :label="item.label"
            :prop="item.key"
        >
            <el-input v-model="value[item.key]" autocomplete="off"/>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitEvt">确定</el-button>
            <el-button @click="resetEvt">重置</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    name: 'MForm',
    props: {
        // 列表
        data: {
            type: Array,
            default: () => []
        },
        // 参数
        value: {
            type: Object,
            default: () => {}
        },
        // 规则
        rules: {
            type: Object,
            default: () => {}
        },
        // 提交回调事件
        submit: Function
    },
    data () {
        return {

        }
    },
    methods: {
         submitEvt () {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    if (this.submit && typeof this.submit === 'function') this.submit(this.value)
                } else {
                    return false;
                }
            })
        },

        resetEvt () {
            this.$refs.form.resetFields()
        }
    }
}
</script>
