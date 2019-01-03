<template>
    <section class="api-edit-mod">
        <header>
            <h1>
                <input type="text" v-model="params.name">
            </h1>

            <div class="set-box">
                <el-button size="mini" @click="cancel">取消</el-button>
                <el-button size="mini" type="primary" @click="previewEvt">预览</el-button>
                <el-button size="mini" type="primary" @click="submitForm">保存</el-button>
            </div>
        </header>
        <section>
            <aceCode :options="aceOptions" v-model="codeInner"/>
            <footer>
                <ul>
                    <li 
                        v-for="type in codeType" 
                        :key="type.value" 
                        @click="setCodeMode(type)"
                        :class="{current: params.type === type.value}"
                    >{{type.label}}</li>
                </ul>
            </footer>
        </section>

        <!-- 预览功能 -->
        <previewMock :show.sync="preview" height="90vh" v-model="params.json"/>
    </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { open } from 'fs';
let option 

export default {
    name: 'api-edit-view',
    data () {
        return {
            // 默认是添加状态
            status: 'add',
            params: {
                apiID: '',
                name: 'new mock',
                method: '',
                type: 'json',
                json: '',
                data: ''
            },
            // 代码格式
            codeType: [
                {
                    label: 'JavaScript',
                    value: 'js'
                },
                {
                    label: 'JSON',
                    value: 'json'
                },
                {
                    label: 'TEXT',
                    value: 'txt'
                }
            ],
            aceOptions: {
                mode: 'javascript',
                theme: 'chrome',
                useWorker: false
            },
            // 代码内容
            codeInner: '',
            // 预览
            preview: false,
            hasError: false
        }
    },
    watch: {
        // 监听代码变化 
        codeInner (val) {
            this.params.data = val
        }
    },
    mounted () {
        if ('mockId' in this.$route.params) {
            this.status = 'edit'
            for (let key in this.params) {
                if (key in this.$route.params.data) {
                    if (key === 'data') {
                        this.codeInner = this.$route.params.data[key]
                    } else {
                        this.params[key] = this.$route.params.data[key]
                    }
                }
            }

            this.params._id = this.$route.params.data._id
        } else {
            this.status = 'add'
            this.params.method = this.$route.params.method
            this.params.apiID = this.$route.params.id
        }

        ipcRenderer.on('ADD_NEW_MOCK_RESULT', (evt, res) => {
            if (res.success) {
                this.$router.go(-1)
                this.$message.success('保存成功')
            } else this.$message.error(res.message)
        })
    },
    methods: {
        getMockJSON () {
            this.hasError = false

            if (!this.codeInner) {
                this.hasError = true
                this.$message({
                    showClose: true,
                    message: '请添加数据',
                    type: 'warning'
                })
                return
            }

            // 处理mock内容
            try {
                switch (this.params.type) {
                    case 'js':
                        option = eval(this.params.data);
                        break;
                    case 'json':
                        option = eval(`(${this.params.data})`)
                        break;
                    default:
                        option = this.params.data
                }
            } catch (err) {
                this.$message.error('模拟数据格式不正确')
                this.hasError = true
                return
            }

            // 设置 mock json
            this.params.json = option
        },

        submitForm () {
            this.getMockJSON()

            if (!this.hasError) {
                if (this.status === 'add') {
                    ipcRenderer.send('ADD_NEW_MOCK', this.params)
                } else {
                    console.log('UPDATE...', this.params)
                    ipcRenderer.send('UPDATE_API_MOCK', {
                        ...this.params
                    })
                }
            }
        },

        // 设置代码 mode
        setCodeMode (type) {
            // 标记选择中
            this.params.type = type.value
            console.log(type)
        },

        cancel () {
            this.$router.go(-1)
        },

        previewEvt () {
            this.getMockJSON()

            if (!this.hasError) this.preview = true
        }
    },
    beforeRouteLeave (to, from , next) {
        ipcRenderer.removeAllListeners('ADD_NEW_MOCK_RESULT')

        next()
    }
}
</script>

<style lang="scss" scoped>
.api-edit-mod {
    display: flex;
    height: 100vh;
    flex-direction: column;
    overflow: auto;

    header {
        display: flex;
        min-height: 60px;
        padding: 0 10px;
        align-items: center;
        user-select: none;
        border-bottom: 1px solid #eee;

        h1 {
            flex: 1;

            input {
                border: none;
                outline: none;
            }
        }

        .set-box {
            .el-button+.el-button {
                margin-left: 5px;
            }
        }
    }

    section {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    footer {
        height: 24px;
        padding: 0 5px;
        line-height: 24px;
        background-color: #F5f5f5 !important;

        li {
            display: inline-block;
            padding: 0 5px;
            color: #777;
            cursor: pointer;

            &:hover,
            &.current {
                color: #09f;
            }

            &[disabled] {
                display: none;
            }
        }
    }
}
</style>
