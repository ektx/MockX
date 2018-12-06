<template>
    <section class="api-edit-mod">
        <header>
            <h1>API Mock</h1>

            <div class="set-box">
                <el-button size="mini" @click="cancel">取消</el-button>
                <el-button size="mini" type="primary" @click="submitForm">保存</el-button>
            </div>
        </header>
        <section>
            <aside>
                <div v-for="item in asideList" :key="item.key" :class="['set-nav', item.classes]" @click="currentNav = item">
                    {{item.label}}
                </div>
            </aside>
            <main>
                <MForm
                    ref="form"
                    v-show="currentNav.key === 'baseInfo'"
                    v-model="params"
                    :data="data"
                    :rules="rules"
                    :submit="submit"
                    disResetBtn
                />
                <div v-show="currentNav.key !== 'baseInfo'" class="code-box">
                    <codeMirror ref="code" v-model="codeInner" :option="codeOption"/>
                    <footer v-if="this.currentNav.key === 'response'">
                        <ul>
                            <li 
                                v-for="type in codeType" 
                                :key="type.value" 
                                @click="setCodeMode(type)"
                                :class="{current: params.mockType === type.value}"
                            >{{type.label}}</li>
                        </ul>
                    </footer>
                </div>
            </main>
        </section>
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
            type: 'add',
            data: [
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
            params: {
                url: '',
                method: '',
                description: '',
                headers: '',
                mock: '',
                mockType: 'json',
                json: ''
            },
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

            // 代码显示配置
			codeOption: {
				lineNumbers: true,
				readOnly: false,
				mode: 'javascript'
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
            // 代码内容
            codeInner: '',
            // 侧边信息
            asideList: [
                {
                    label: '基础信息',
                    key: 'baseInfo'
                }, 
                {
                    label: 'headers 设置',
                    key: 'headers'
                },
                {
                    label: '响应信息设置',
                    key: 'response'
                }
            ],
            // 当前菜单
            currentNav: {}
        }
    },
    watch: {
        currentNav (val, old) {
            if (old.classes) old.classes = ''
            if (val.classes) {
                val.classes = 'active'
            } else {
                this.$set(val, 'classes', 'active')
            }

            // 回显 code
            if (this.$refs.code) {
                if (val.key === 'headers') {
                    this.$refs.code.setValue(this.params.headers)
                } else if (val.key === 'response') {
                    this.$refs.code.setValue(this.params.mock)
                }
            }
        },

        // 监听代码变化 
        codeInner (val) {
            if (this.currentNav.key === 'headers') {
                this.params.headers = val
            } else if (this.currentNav.key === 'response') {
                this.params.mock = val
            }
        }
    },
    mounted () {
        ipcRenderer.on('SAVE_API_RESULT', (evt, res) => {
            if (res.success) this.$message.success('保存成功')
            else this.$message.error(res)
        })

        ipcRenderer.on('UPDATE_API_RESULT', (evt, res) => {
            if (res.success) this.$message.success('更新成功')
            else this.$message.error('更新失败')
        })

        // 处理是否是编辑状态
        if (this.$route.params.json) {
            this.type = 'edit'

            Object.assign(this.params, this.$route.params)

            // 设置代码回显
            this.$refs.code.setValue(this.params.mock)
        }

        // 
        this.currentNav = this.asideList[0]
    },
    methods: {
        submit () {
            switch (this.params.mockType) {
                case 'js':
                    option = eval(this.params.mock);
                    break;
                case 'json':
                    option = eval(`(${this.params.mock})`);
                    break;
                default:
                    option = this.params.mock
            }
            
            // 设置 mock json
            this.params.json = option
            console.log(option, 555)
            this.type === 'add' ? this.save() : this.update()
        },

        submitForm () {
            this.$refs.form.submitEvt()
        },

        save () {
            Object.assign(this.params, {
                projectId: this.$route.params._id,
                baseUrl: this.$route.params.baseUrl
            })
            console.log(this.params, 'save')
            ipcRenderer.send('SAVE_API', this.params)
        },

        update () {
            console.warn(this.params)
            ipcRenderer.send('UPDATE_API', this.params)
        },

        // 设置代码 mode
        setCodeMode (type) {
            // 标记选择中
            this.params.mockType = type.value
            console.log(type)
        },

        cancel () {
            this.$router.go(-1)
        }
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
            flex: 1
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
        overflow: hidden;

        aside {
            padding: 20px 0;
            width: 120px;
            height: 100%;
            overflow: auto;
            box-sizing: border-box;
            border-right: 1px solid #eee;

            .set-nav {
                padding: 0 10px;
                font-size: 14px;
                line-height: 2;
                color: #333;
                cursor: pointer;

                &.active {
                    color: #09f;
                }
                &:hover {
                    background-color: #f5f5f5;
                }
            }
        }

        main {
            flex: 1;
        }
    }
}

.code-box {
    height: 100%;
    display: flex;
    flex-direction: column;

    .v-code-moirror-box {
        flex: 1;
    }

    footer {
        height: 24px;
        padding: 0 5px;
        line-height: 24px;
        background-color: #3d3f48 !important;

        li {
            display: inline-block;
            padding: 0 5px;
            color: #777;
            cursor: pointer;

            &:hover,
            &.current {
                color: rgb(190, 190, 190);
            }

            &[disabled] {
                display: none;
            }
        }
    }
}
</style>

