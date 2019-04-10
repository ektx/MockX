<template>
    <div class="api-info-box">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="基础信息" name="baseInfoTab">
                <ul-list :data="list" :format="apiFormat"/>
                <i class="el-icon-edit" title="编辑基础信息" @click="editApi"></i>
            </el-tab-pane>
            <el-tab-pane label="请求头信息" name="second">
                开发中...
            </el-tab-pane>
            <el-tab-pane label="请求参数信息" name="third">
                <editList :header="tableHeader" v-model="data.params"/>
                <i class="el-icon-plus" title="添加" @click="addNewParam"></i>
            </el-tab-pane>
            <el-tab-pane label="响应信息" name="fourth">
                <i class="el-icon-plus" title="添加" @click="toEditMock('response', true, data)"></i>
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
                                    <span :title="item.updatedAt">更新于: {{formatTime(item.updatedAt)}}</span>
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
            </el-tab-pane>
            <el-tab-pane label="代理" name="proxyTab">
                <ProxyMod :project="project" :api="data"/>
            </el-tab-pane>

            <el-tab-pane label="测试" name="testTab">
                开发中...
            </el-tab-pane>
        </el-tabs>

    </div>
</template>

<script>
import { mapState } from 'vuex'
import { ipcRenderer, ipcMain } from 'electron'
import {object as mock, toMD} from '@ektx/mocks'
import ProxyMod from './proxyMod.vue'

export default {
    name: 'project-api-info',
    components: {
        ProxyMod
    },
    props: {
        data: {
            type: Object,
            default: null
        },
        project: {
            type: Object,
            default: () => {}
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
                    label: '参数',
                    key: 'key',
                    unique: true,
                    type: 'input'
                },
                {
                    label: '类型',
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
                    label: '必填',
                    key: 'required',
                    type: 'select',
                    options: [
                        {
                            label: '是',
                            value: true
                        },
                        {
                            label: '否',
                            value: false
                        }
                    ]
                },
                {
                    label: '描述',
                    key: 'description',
                    type: 'input'
                }
            ],
            // data.parmas 唯一对象
            paramsUnique: [],
            activeTab: 'baseInfoTab'
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

                // 设置默认的使用代理
                if (!('usedProxy' in val)) {
                    this.$set(val, 'usedProxy', {
                        open: true,
                        index: 0
                    })
                }

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

        // 更新 data.parmas 中的唯一值
        updateUnique () {
            if (this.data.params) {
                this.paramsUnique = []
                // 获取 data.params unique
                this.data.params.forEach(it => {
                    this.paramsUnique.push(it.key)
                })
            }
        },

        formatTime (time) {
            return this.$moment(time).fromNow().replace(/\s/, '')
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
    height: 100%;
    overflow: hidden;

    /deep/ .el-tabs {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;

        .el-tabs__content {
            flex: 1;
            overflow: auto;
        }
    }

    & > div {
        margin-bottom: 2em;
    }
    
    /deep/ h3 {
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
        top: 0px;
        z-index: 90;
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid #eee;
        background: #fff;

        main {
            flex: 1;
            margin: 3px 0;

            .el-checkbox {
                margin-right: 5px;
            }

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

.proxy-list-box {
    li {
        margin: 5px 0;
        padding: 5px;
        color: #777;
        font-size: 12px;
        border: 1px solid #ddd;
        border-radius: 3px;
        cursor: pointer;

        p {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        p:first-child {
            font-size: 16px;
            color: #333;
        }

        &.used {
            color: rgba(255, 255, 255, .6);
            background-color: #09f;
            border-color: transparent;

            p:first-child {
                color: #fff;
            }
        }
    }
}

</style>
