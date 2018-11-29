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
                <codeMirror v-model="params.mock" :option="codeOption"/>
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
            if (res.success) {
                this.$message({
                    message: res.message,
                    type: 'success'
                })
            } else {
                this.$message.error(res.message)
            }
        })
    },
    methods: {
        submit () {
            console.log(this.params)
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

            Object.assign(this.params, {
                projectId: this.$route.params._id,
                baseUrl: this.$route.params.baseUrl,
                json: option
            })

            ipcRenderer.send('SAVE_API', this.params)
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

