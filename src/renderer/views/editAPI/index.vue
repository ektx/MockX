<template>
    <section class="api-edit-mod">
        <header>
            <h1>API Mock</h1>
        </header>
        <section>
            <aside>
                <MForm
                    v-model="params"
                    :data="data"
                    :rules="rules"
                    labelPosition="top"
                    :submit="submit"
                    disResetBtn
                />
            </aside>
            <main>
                <codeMirror ref="code" v-model="params.mock" :option="codeOption"/>
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
                },
                {
                    label: '请求参数',
                    key: 'params',
                    type: 'addObject'
                },
                {
                    label: '数据类型',
                    key: 'mockType',
                    type: 'select',
                    options: [
                        {
                            label: 'JSON',
                            value: 'json'
                        },
                        {
                            label: 'JS',
                            value: 'js'
                        },
                        {
                            label: 'Text',
                            value: 'txt'
                        }
                    ]
                }
            ],
            params: {
                url: '',
                method: '',
                description: '',
                params: [],
                mock: '',
                mockType: 'json'
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
        }
    },
    mounted () {
        ipcRenderer.on('SAVE_API_RESULT', (evt, res) => {
            if (res.success) this.$message.success('保存成功')
            else this.$message.error('保存失败')
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
            this.type === 'add' ? this.add() : this.update()
        },

        save () {
            Object.assign(this.params, {
                projectId: this.$route.params._id,
                baseUrl: this.$route.params.baseUrl
            })

            ipcRenderer.send('SAVE_API', this.params)
        },

        update () {
            console.warn(this.params)
            ipcRenderer.send('UPDATE_API', this.params)
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
        min-height: 60px;
        border-bottom: 1px solid #eee;
    }

    section {
        flex: 1;
        display: flex;
        overflow: hidden;

        aside {
            width: 40%;
            max-width: 300px;
            height: 100%;
            padding: 20px 20px;
            overflow: auto;
            box-sizing: border-box;
        }

        main {
            flex: 1;
        }
    }
}
</style>

