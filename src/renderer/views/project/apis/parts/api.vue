<template>
    <div class="api-info-box">
        <div class="base-info-box">
            <h3>
                <span>基础信息</span>
                <i class="el-icon-edit" title="编辑基础信息" @click="editApi"></i>
            </h3>
            <ul-list :data="list" :format="apiFormat"/>
        </div>

        <div class="headers-box">
            <h3>
                <span>请求头信息</span>
            </h3>        
        </div>

        <div class="params-box">
            <h3>
                <span>请求参数信息</span>
                <i class="el-icon-plus" title="添加" @click="addNewParam"></i>
            </h3>
            <editList :header="tableHeader" v-model="data.params"/>
        </div>

        <div class="response-box">
            <h3>
                <span>响应信息</span>
                <i class="el-icon-plus" title="添加" @click="toEditMock('response', true, data)"></i>
            </h3>
            <div class="radio-list-box">
                <div class="mock-list-box" v-for="item in resList" :key="item._id">
                    <header>
                        <main>
                            <p>
                                <el-checkbox :value="item.used" @change="updateResCurrent(item)"></el-checkbox>
                                <span class="name">{{item.name}}</span>
                            </p>
                            <p>
                                <span>类型: {{item.type}}</span>
                                <span>更新于: {{item.updatedAt}}</span>
                            </p>
                        </main>
                        <aside>
                            <i class="el-icon-edit" title="编辑" @click="toEditMock('respinse', false, item)"></i>
                            <i class="el-icon-delete" @click="delThisMock(item)"></i>
                        </aside>
                    </header>
                    <marked class="marked-box" :value="getMarkedStr(item.json)"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { ipcRenderer, ipcMain } from 'electron'
import { object as mock, toMD } from '../../../../../common/mocks/index.js'

export default {
    name: 'project-api-info',
    props: {
        data: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            apiFormat: [
                {
                    label: '基础 URL',
                    key: 'url',
                    evt: this.copyUrl
                },
                {
                    label: '项目 URL',
                    key: ['baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: '本地访问',
                    key: ['local', 'baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: '局域网访问',
                    key: ['host', 'baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: 'Method',
                    key: 'method'
                },
                {
                    label: '描述',
                    key: 'description'
                }
            ],
            list: {},

            resList: {},
            resCheckbox: null,
            resCurrent: null,
            resCurrentStatus: 'auto',

            tableHeader: [
                {
                    label: 'Key',
                    key: 'key',
                    unique: true,
                    type: 'input'
                },
                {
                    label: 'Type',
                    key: 'type',
                    type: 'select',
                    options: [
                        {
                            label: '字符串',
                            value: 'string'
                        },
                        {
                            label: '数字',
                            value: 'number'
                        }
                    ]
                },
                {
                    label: 'Description',
                    key: 'description',
                    type: 'input'
                }
            ],
            // data.parmas 唯一对象
            paramsUnique: []
        }
    },
    computed: {
        ...mapState('server', ['host', 'port'])
    },
    watch: {
        data: {
            handler (val) {
                console.log(val)
                // 切换api时，重置
                this.resCurrent = null

                // 扩展基础信息
                this.list = Object.assign({}, val, {
                    host: 'http://'+ this.host+':'+this.port,
                    local: 'http://localhost:'+this.port
                })

                // 获取所有的 mocks
                ipcRenderer.send('GET_API_MOCKS', {
                    apiID: this.data._id
                })

                this.updateUnique()
            },
            immediate: true
        },

        'data.params': {
            handler (val) {
                console.log(val, this.data._id)
                this.updateUnique()

                // 更新
                ipcRenderer.send('ADD_API_PARAMS', {
                    id: this.data._id,
                    baseUrl: this.data.baseUrl,
                    params: val
                })
            },
            deep: true
        },

        resCurrent (val, old) {
            if (this.resCurrentStatus === 'auto') return
            // 如果 val 或 old 都没有内容，我们不更新
            if (!val) return

            if (old) {
                old.used = false
                ipcRenderer.send('UPDATE_API_MOCK', {
                    _id: old._id,
                    used: false
                })
            
            }
            
            val.used = true
            ipcRenderer.send('UPDATE_API_MOCK', {
                _id: val._id,
                used: val.used
            })
            // 恢复状态 防止自动更新
            this.resCurrentStatus = 'auto'
        }
    },
    mounted () {
        ipcRenderer.on('GET_API_MOCKS_RESULT', (evt, res) => {
            if (res.success) {
                this.resList = res.data

                res.data.forEach(item => {
                    if (item.used) this.resCurrent = item
                })
            } else {
                this.$message.error(res.message)
            }
        })
        
        ipcRenderer.on('DELETE_MOCK_RESULT', (evt, res) => {
            if (res.success) {
                // 获取所有的 mocks
                ipcRenderer.send('GET_API_MOCKS', {
                    apiID: this.data._id
                })
            } else {
                this.$message.error(res.message)
            }
        })
        
    },
    methods: {
        copyUrl ({value}) {
            navigator.clipboard
                .writeText(value)
                .then(() => {
                    this.$message.success('复制成功')
                })
                .catch(err => {
                    this.$message.error(`Could not copy text: ${err}`)
                })
           
        },

        editApi () {
            this.$parent.addNewAPI = true
            this.$parent.apiData = this.data
            console.log(this.data, this.$parent.apiData)
        },

        toEditMock (type, isAdd, data) {
            let params = {
                method: type,
                projectID: this.data.baseUrl
            }

            if (isAdd) {
                params.id = data._id
            } else {
                params.mockId = data._id,
                params.data = data
            }

            this.$router.push({
                name: 'editMock',
                params
            })
        },

        // 更新当前使用的 mock
        updateResCurrent (item) {
            this.resCurrentStatus = 'update'
            this.resCurrent = item
        },

        delThisMock (item) {
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    ipcRenderer.send('DELETE_MOCK', {
                        _id: item._id
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                })
        },

        // getMockStr (data) {
        //     return typeof data === 'object' ? JSON.stringify(mock(data), '', '\t') : data
        // },

        // marked 文档
        getMarkedStr (str) {
            return toMD({
                data: str,
                preview: true
            })
        },
        
        // 添加一个新的 params
        addNewParam () {
            // 如果有 new 这个字段，不允许添加新的params
            // new 是预设
            if (this.paramsUnique.includes('new')) return

            this.paramsUnique.push('new')
           
            this.data.params.push({
                key: 'new',
                type: 'string',
                description: ''
            })
        },

        // editParams (value, item, key) {
        //     console.log(value, item, key, item[key])
        //     if (key === 'key') {
        //         console.log(this.data.params)
        //         this.data.params.forEach(it => {
        //             if (it[key] === value) {
        //                 console.log('warn')
        //                 it.classes = 'error'
        //                 item.classes = 'warn'
        //             }
        //         })
        //     }
        // },
        // 更新 data.parmas 中的唯一值
        updateUnique () {
            this.paramsUnique = []
            // 获取 data.params unique
            this.data.params.forEach(it => {
                this.paramsUnique.push(it.key)
            })
        }
    },
    beforeRouteLeave (to, from, next) {
        ipcRenderer.removeAllListeners('GET_API_MOCKS_RESULT')
        ipcRenderer.removeAllListeners('DELETE_MOCK_RESULT')

        next()
    }
}
</script>

<style lang="scss" scoped>
.api-info-box {
    margin: 0 10px;

    & > div {
        margin-bottom: 2em;
    }
    
    h3 {
        position: sticky;
        top: 0;
        z-index: 100;
        padding: 0 0 8px;
        border-bottom: 1px solid #ddd;
        background-color: #fff;
        user-select: none;

        span {
            font-size: 18px;
            color: #333;
            font-weight: 400;
        }

        i {
            float: right;
            margin: 7px 5px 0;
            cursor: pointer;

            &:hover {
                color: #09f;
            }
        }
    }
}
.mockx-ul-list-mod {
    /deep/ li{
        &.url {
            span {
                cursor: pointer;
        
                &:hover {
                    color: #09f;
                }
            }
        }
        &.method {
            span {
                text-transform: uppercase;
            }
        }
    }
}

.mock-list-box {
    header {
        position: sticky;
        top: 31px;
        z-index: 90;
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid #eee;
        background: #fff;

        main {
            flex: 1;
            margin: 3px 0;

            .name {
                font-size: 14px;
                line-height: 2em;
                color: #333;
            }

            span {
                margin-right: 10px;
            }
        }

        aside {
            line-height: 50px;

            i {
                font-size: 16px;
                color: #333;
                cursor: pointer;

                &:hover {
                    color: #09f;
                }
            }
        }

    }
}

.marked-box {
    margin: 1em 0 2em;

    /deep/ h1 {
        font-size: 16px;
        margin: 2rem 0 0rem 0;
    } 
    /deep/ h2, 
    /deep/ h3, 
    /deep/ h4 {
        margin: 3rem 0 0rem 0;
        font-size: 14px;
        text-transform: capitalize;
    }

    /deep/ table {
        margin: 0.5em 0;

    }
}

</style>
