<template>
    <el-dialog :title="title" :visible.sync="iShow">
        <MForm
            class="my-form"
            ref="form"
            v-model="params"
            :data="formFormat"
            :rules="rules"
            :submit="submit"
            labelWidth="70px"
            disResetBtn
            disSubmitBtn
        />
        <div slot="footer" class="dialog-footer">
            <el-button @click="iShow = false">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
    name: 'addAPI-dialog',
    props: {
        // 控制显示与隐藏
        value: {
            type: Boolean,
            default: false
        },
        // 当前项目信息
        project: {
            type: Object,
            default: null
        },
        // 默认值
        data: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            title: '添加 API',
            iShow: false,
            params: {
                url: '',
                description: '',
                method: 'GET'
            },
            formFormat: [
                {
                    label: 'URL',
                    key: 'url',
                    type: 'input'
                },
                {
                    label: 'method',
                    key: 'method',
                    type: 'select',
                    options: [
                        {
                            label: 'POST',
                            value: 'post'
                        },
                        {
                            label: 'GET',
                            value: 'get'
                        }
                    ]
                },
                {
                    label: '接口描述',
                    key: 'description',
                    type: 'input'
                }
            ],
            rules: {
                url: [
                    {
                        required: true,
                        message: '地址不能为空',
                        trigger: 'blur'
                    }
                ],
                method: [
                    {
                        required: true,
                        message: '请求方式不能为空',
                        trigger: 'blur'
                    }
                ]
            },
        }
    },
    watch: {
        value (val) {
            this.iShow = val
        },
        iShow (val) {
            this.$emit('input', val)
        },
        data (val) {
            if (val) {
                this.title = '编辑 API'
                // 回显内容
                Object.assign(this.params, val)
                // 显示不可编辑状态
                this.formFormat[0].disabled = true
            } else {
                this.title = '添加 API'
                this.formFormat[0].disabled = false
            }
        }
    },
    mounted () {

        ipcRenderer.on('ADD_API_RESULT', (evt, res) => {
            if (res.success) {
                this.$message.success(res.message)
                this.$emit('update')
                this.iShow = false
            } else {
                this.$message.error(res.message)
            }
        })

        // 接收更新服务器结果
        ipcRenderer.on('UPDATE_API_RESULT', (evt, res) => {
            if (res.success) {
                this.$message.success('更新成功')
                this.$emit('update')
                this.iShow = false
            }
            else this.$message.error('更新失败')
        })
    },
    methods: {
        submit (status) {
            let way = this.data ? 'UPDATE_API' : 'ADD_API'
            // 表单错误提醒
            if (!status) return this.$message.error('表单出现错误')

            let params = Object.assign({}, this.params, {
                baseUrl: this.project.baseUrl
            })

            ipcRenderer.send(way, params)
        },
    },
    beforeRouteLeave (to, from, next) {
        ipcRenderer.removeAllListeners('ADD_API_RESULT')
        ipcRenderer.removeAllListeners('UPDATE_API_RESULT')

        next()
    }
}
</script>
