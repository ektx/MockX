<template>
    <section class="apis-view">
        <aside>
            <header>
                <el-input 
                    class="search-box" 
                    placeholder="Search: API" 
                    v-model="search" 
                    clearable 
                    size="mini"
                >
                    <el-button slot="append" icon="el-icon-plus" @click="addApi"></el-button>
                </el-input>
            </header>
            <ul class="apis-list">
                <li 
                    v-for="api in list" 
                    :key="api._id" 
                    :class="api.classes"
                    @click="current = api"
                >
                    <div class="url">{{api.url}}</div>
                    <div>
                        <span :class="['method',api.method]">{{api.method}}</span>
                        <span class="mock-type">{{api.mockType}}</span>
                    </div>
                </li>
            </ul>
        </aside>
        <main>
            <header>
                <h1>{{current.url}}</h1>
                <div class="set-box">
                    <el-button-group>
                        <el-button size="mini" @click="goList">返回</el-button>
                        <el-button size="mini" @click="preview = !preview">预览</el-button>
                    </el-button-group>
                    
                    <el-dropdown class="set-list" @click="copyUrl('min')" size="mini" split-button @command="copyUrl" >
                        复制
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="ip">IP路径</el-dropdown-item>
                            <el-dropdown-item command="local">本地路径</el-dropdown-item>
                            <el-dropdown-item command="project">项目形式</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <el-dropdown class="set-list" size="mini" split-button @click="editApi" @command="removeApi" >
                        编辑
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command='remove'>删除</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </header>
            <ul class="api-info">
                <li 
                    v-for="(item, index) in apiFormat"
                    :key="index"
                    :class="[item.key]"
                >
                    <label>{{item.label}}: </label>
                    <span>{{item.value}}</span>
                </li>
            </ul>

            <marked :value="markedInner"/>
        </main>

        <!-- 预览 mock 内容 -->
        <previewMock v-model="code" :show.sync="preview"/>
    </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'
import { tomd } from '../../../../common/mocks/index.js'


export default {
    name: 'apis-view',
    components: {
    },
    data () {
        return {
            // 当前项目
            project: JSON.parse(localStorage.project),
            search: '',
            list: [],
            current: {},
            apiFormat: [
                {
                    label: 'URL',
                    key: ['baseUrl', 'url']
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
            preview: false,
            code: '',
            markedInner: ''
        }
    },
    computed: {
        ...mapState('server', ['host', 'port'])
    },
    watch: {
        current (val, old) {
            if (Reflect.has(old,'classes')) old.classes = ''

            if (Reflect.has(val,'classes')) {
                val.classes = 'hold'
            } else {
                this.$set(val, 'classes', 'hold')
            }

            this.formatData()
            this.getMarked()
        },

        preview (val) {
            if (val) {
                this.code = this.current.mockType === 'txt' 
                    ? this.current.mock 
                    : this.current.json
            }
        },

        search (val) {
            ipcRenderer.send('SEARCH_APIS', val, this.project.baseUrl)
        }

    },
    mounted () {
        this.getAPIs()

        ipcRenderer.on('GET_ALL_APIS_RESULT', (evt, res) => {
            if (res.success) {
                if (res.data.length) {
                    this.list = res.data
                    this.current = this.list[0]
                }
            } else {
                this.$message.error(res.message)
            }
        })

        ipcRenderer.on('REMOVE_API_RESULT', (evt, res) => {
            if (res.success) {
                this.getAPIs()
                this.$message.success('删除成功！')
            } 
        })

        ipcRenderer.on('SEARCH_APIS_RESULT', (evt, res) => {
            if (res.success) {
                this.list = res.data
            }
        })

    },
    methods: {
        addApi () {
            this.$router.push({
                name: 'editAPI',
                params: Object.assign(this.project, {
                    api: 'add'
                })
            })
        },

        editApi () {
            this.$router.push({
                name: 'editAPI',
                params: Object.assign(this.current, {
                    api: 'edit'
                })
            })
        },

        getAPIs () {
            ipcRenderer.send('GET_ALL_APIS', {
                id: this.project._id
            })
        },

        formatData () {
            this.apiFormat.forEach(item => {
                if (Array.isArray(item.key)) {
                    item.value = item.key.reduce((a, b) => {
                        return `${this.current[a]}/${this.current[b]}`
                    })
                } else {
                    item.value = this.current[item.key]
                }
            })
        },

        goList () {
            this.$router.push({name: 'projectList'})
        },

        copyUrl (type) {
            let host = ''
            switch (type) {
                case 'ip': 
                    host = `http://${this.host}:${this.port}/${this.current.baseUrl}`; 
                    break;
                case 'local':
                    host = `http://localhost:${this.port}/${this.current.baseUrl}`;
                    break;
                case 'project':
                    host = `${this.current.baseUrl}`
            }

            let url = `${host}/${this.current.url}`

            navigator.clipboard
                .writeText(url)
                .then(() => {
                    this.$message.success('复制成功')
                })
                .catch(err => {
                    this.$message.error(`Could not copy text: ${err}`)
                })
           
        },

        removeApi (type) {

            type === 'remove' && 
            this.$confirm(`此操作将永久删除, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ipcRenderer.send('REMOVE_API', this.current)
            }).catch(() => {

            })
        },

        getMarked () {
            if (this.current.mockType !== 'txt') {
                this.markedInner = tomd(Object.freeze(this.current.json)
                )
            }
        }
    },
    beforeRouteLeave (to, from , next) {
        ipcRenderer.removeAllListeners('GET_ALL_APIS_RESULT')
        ipcRenderer.removeAllListeners('REMOVE_API_RESULT')
        ipcRenderer.removeAllListeners('SEARCH_APIS_RESULT')

        next()
    }
}
</script>

<style lang="scss" scoped>
.apis-view {
    display: flex;
    width: 100%;
    height: 100vh;

    aside {
        display: flex;
        flex-direction: column;
        width: 230px;
        height: 100%;
        border-right: 1px solid #eee;

        header {
            margin: 10px 5px;
        }
    }

    main {
        flex: 2.5;
        color: #333;
        overflow: auto;

        header {
            display: flex;
            flex-direction: column;

            h1 {
                flex: 1;
                margin: 20px 10px 0 10px;
                font-size: 18px;
                font-weight: 400;
            }
            .set-box {
                margin: 10px;
            
                .back-list {
                    width: 24px;
                    height: 24px;
                    color: #777;
                    text-align: center;
                    line-height: 24px;
                    border-radius: 100%;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    transition: 
                        border-color .3s ease-in-out,
                        background-color .3s ease-in-out;

                    &:hover {
                        border-color: #ccc;
                        background-color: #f5f5f5;
                    }
                }

                .set-list {
                    vertical-align: middle;
                }
            }
        }
    }
}

.apis-list {
    flex: 1;
    overflow: auto;
    border-top: 1px solid #eee;

    li {
        padding: 8px 5px;
        font-size: 11px;
        border-bottom: 1px solid #eee;

        .url {
            font-size: 14px;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-weight: bold;
            color: #333;
            overflow: hidden;
        }

        .method {
            text-transform: uppercase;

            &.post {
                color: #09f;
            }
            &.get {
                color: yellowgreen;
            }
        }

        .mock-type {
            margin: 0 0 0 5px;
            color: #666;
            text-transform: uppercase;
        }

        &.hold {
            background: #f1f1f1;
        }
    }
}

.api-info {
    margin: 10px;
    font-size: 13px;
    line-height: 24px;

    li {
        &.method {
            span {
                text-transform: uppercase;
            }
        }
    }

    label {
        color: #777;
        margin-right: 3px;
    }
}

</style>

<style lang="scss">
.el-dialog__body {
    height: 50vh;
}

</style>

