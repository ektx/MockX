<template>
    <el-form 
        ref="form" 
        :model="value" 
        :label-position="labelPosition"
        :label-width="labelWidth" 
        :rules="rules" 
        size="mini"
    >
        <el-form-item 
            v-for="(item, index) in data" 
            :key="index" 
            :label="item.label"
            :prop="item.key"
        >
            <el-select v-if="item.type === 'select'" v-model="value[item.key]" placeholder="请选择">
                <el-option 
                    v-for="(opt, optI) in item.options" 
                    :key="optI" 
                    :label="opt.label" 
                    :value="opt.value"></el-option>
            </el-select>

            <template v-else-if="item.type === 'addObject'">
                <div 
                    v-for="(addList, addIndex) in value[item.key]"
                    :key="addList.id" 
                    class="add-box"
                >
                    <el-input v-model="addList.key" placeholder="key" autocomplete="off"/>
                    <el-input v-model="addList.val" placeholder="value" autocomplete="off"/>
                    <el-button @click="delList(addIndex, value[item.key])">删除</el-button>
                    <el-input 
                        class="addList-description" 
                        v-model="addList.description" 
                        placeholder="描述" autocomplete="off"
                    />
                </div>
                <el-button type="primary" @click="addList(value[item.key])">添加</el-button>
            </template>

            <template v-else-if="item.type === 'textarea'">
                <el-input
                    type="textarea"
                    :rows="2"
                    placeholder="请输入内容"
                    v-model="value[item.key]">
                </el-input>
            </template>

            <el-switch v-else-if="item.type === 'switch'" v-model="value[item.key]"></el-switch>

            <el-input v-else v-model="value[item.key]" autocomplete="off"/>
        </el-form-item>
        <el-form-item>
            <el-button v-if="!disSubmitBtn" type="primary" @click="submitEvt">确定</el-button>
            <el-button v-if="!disResetBtn" @click="resetEvt">重置</el-button>
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
        submit: Function,
        // left top right
        labelPosition: {
            type: String,
            default: 'left'
        },
        labelWidth: {
            type: String,
            default: '100px'
        },
        disSubmitBtn: {
            type: Boolean,
            default: false
        },
        disResetBtn: {
            type: Boolean,
            default: false
        }
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
        },

        addList (list) {
            console.log(list)
            list.push({
                id: +new Date,
                key: '',
                val: '',
                discription: ''
            })
        },

        delList (index, list) {
            console.log(index, list)
            list.splice(index, 1)
        }
    }
}
</script>

<style lang="scss">
.add-box {
    display: grid;
    margin-bottom: 10px;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

    .el-input:first-child {
        grid-column: 1 / span 2;
    }
    .el-input:nth-child(2) {
        grid-column: 3 / 5;
    }

    .addList-description {
        margin: 0 0 3px;
        grid-column: 1 / span 5;
    }
}
</style>
