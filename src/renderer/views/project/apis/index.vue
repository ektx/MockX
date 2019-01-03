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
                    @click="setCurrent(api)"
                >
                    <span class="name">{{api.url}}</span>
                    <span :class="['method',api.method]" :title="api.method"></span>
                </li>
            </ul>
        </aside>
        <main>
            <header>
                <h1 :title="title">{{title}}</h1>
            </header>
            <div class="content-box">
                <APIProjectInfo v-if="!current" :data="project"/>
                <APIInfo v-else :data="current"/>
            </div>
        </main>

        <AddNewAPI v-model="addNewAPI" :project="project" :data="apiData" @update="getAPIs"/>
        
    </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'
import { tomd } from '../../../../common/mocks/index.js'
import APIProjectInfo from './project.vue'
import APIInfo from './api.vue'
import AddNewAPI from './addAPI.vue'

export default {
    name: 'apis-view',
    components: {
        APIProjectInfo,
        APIInfo,
        AddNewAPI
    },
    data () {
        return {
            // 当前项目
            project: JSON.parse(localStorage.project),
            title: '',
            search: '',
            list: [],
            current: null,
            code: '',
            // 接口返回内容markdown文档化内容
            // markedInner: '',
            // 请求头信息 markdown 文档化内容
            // headerMarked: '',
            addNewAPI: false,
            // 添加api的默认内容
            apiData: null
        }
    },
    computed: {
        ...mapState('server', ['host', 'port'])
    },
    watch: {
        current (val, old) {
            // 如果 vall = null
            if (!val) {
                this.title = this.project.name
            } else {
                this.title = val.description || val.url
            }

            if (old && Reflect.has(old,'classes')) old.classes = ''

            if (val) {
                if (Reflect.has(val,'classes')) {
                    val.classes = 'hold'
                } else {
                    this.$set(val, 'classes', 'hold')
                }

                // this.markedInner = ''
                // this.headerMarked = ''

                // this.formatData()
                // this.getMarked()
            }
        },

        search (val) {
            ipcRenderer.send('SEARCH_APIS', val, this.project.baseUrl)
        }

    },
    mounted () {
        this.getAPIs()

        this.title = this.project.name

        ipcRenderer.on('GET_ALL_APIS_RESULT', (evt, res) => {
            if (res.success) {
                if (res.data.length) {
                    this.list = res.data
                    // this.current = this.list[0]
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
            this.addNewAPI = true
        },

        editApi () {
            this.$router.push({
                name: 'editAPI',
                params: Object.assign({}, this.current, {
                    api: 'edit'
                })
            })
        },

        getAPIs () {
            ipcRenderer.send('GET_ALL_APIS', {
                baseUrl: this.project.baseUrl
            })
        },

        goList () {
            this.$router.push({name: 'projectList'})
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

        setCurrent (api) {
            if (this.current && this.current.url === api.url) {
                this.current = null
            } else {
                this.current = api
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
        display: flex;
        flex-direction: column;
        color: #333;
        overflow: auto;

        header {
            width: 100%;
            padding: 20px 10px 0;
            box-sizing: border-box;
            -webkit-app-region: drag;

            h1 {
                font-size: 18px;
                font-weight: 400;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .set-box {
                margin: 10px 0;
                -webkit-app-region: no-drag;
            
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

        .content-box {
            flex: 1;
            overflow: auto;
        }
    }
}

.apis-list {
    flex: 1;
    overflow: auto;
    border-top: 1px solid #eee;

    li {
        position: relative;
        display: flex;
        padding: 5px 3px;
        align-items: center;
        user-select: none;
        cursor: pointer;
        transition: background 0s ease-in-out;

        .name {
            flex: 1;
            margin-left: 5px;
            font-size: 14px;
            color: #333;
            max-width: 95%;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .method {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 100%;
            background: currentColor;

            &.post {
                color: #09f;
            }
            &.get,&.GET {
                color: #8BC34A;
            }
        }

        &::after {
            position: absolute;
            bottom: 0;
            left: 5px;
            right: 0;
            content: '';
            border-bottom: 1px solid #eee;
        }

        &.hold {
            background: #f1f1f1;
            transition: background .3s ease-in-out;
        }
    }
}
</style>

