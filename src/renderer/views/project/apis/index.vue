<template>
    <section class="apis-view">
        <aside>
            <header>
                <div class="apis-aside-set-header">
                    <icon class="icon-menu" @click="goToList" />
                    <span></span>
                    <!-- <i class="el-icon-search"></i> -->
                    <i class="el-icon-plus" @click="addNewAPI = true"></i>
                </div>
                <div class="search-box">
                    <el-input 
                        placeholder="Search: API" 
                        v-model="search" 
                        clearable 
                        size="mini"
                    />
                </div>
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
                    <i class="el-icon-error" @click="removeApi(api)"></i>
                </li>
            </ul>
        </aside>
        <main>
            <header>
                <h1 :title="title">{{title}}</h1>
            </header>
            <div class="content-box">
                <APIProjectInfo v-if="!current" :data="project"/>
                <APIInfo v-else :data="current" :project="project"/>
            </div>
        </main>

        <AddNewAPI v-model="addNewAPI" :project="project" :data="apiData" @update="getAPIs"/>
        
    </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import APIProjectInfo from './parts/project.vue'
import APIInfo from './parts/api.vue'
import AddNewAPI from './parts/addAPI.vue'

export default {
    name: 'project-apis-view',
    components: {
        APIProjectInfo,
        APIInfo,
        AddNewAPI
    },
    data () {
        return {
            // 当前项目
            project: {},
            title: '',
            search: '',
            list: [],
            current: null,
            addNewAPI: false,
            // 添加api的默认内容
            apiData: null
        }
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
            }
        },

        search (val) {
            ipcRenderer.send('SEARCH_APIS', val, this.project.baseUrl)
        }

    },
    activated () {
        console.log(2)
        this.init()
    },
    deactivated () {
        ipcRenderer.removeAllListeners('GET_ALL_APIS_RESULT')
        ipcRenderer.removeAllListeners('REMOVE_API_RESULT')
        ipcRenderer.removeAllListeners('SEARCH_APIS_RESULT')
    },
    methods: {
        init () {
            this.project = JSON.parse(localStorage.project)
            this.title = this.project.name

            this.getAPIs()

            ipcRenderer.on('GET_ALL_APIS_RESULT', (evt, res) => {
                if (res.success) {
                    this.list = res.data
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

        getAPIs () {
            ipcRenderer.send('GET_ALL_APIS', {
                baseUrl: this.project.baseUrl
            })
        },

        removeApi (api) {
            this.$confirm(`此操作将永久删除, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ipcRenderer.send('REMOVE_API', api)
            }).catch(() => {

            })
        },

        setCurrent (api) {
            if (this.current && this.current.url === api.url) {
                this.current = null
            } else {
                this.current = api
            }
        },

        goToList () {
            this.$router.push({name: 'projectList'})
        }
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
        background-color: #f5f5f5;

        header {
            .apis-aside-set-header {
                display: flex;
                padding: 10px 5px 5px 5px;
                -webkit-app-region: drag;

                span {
                    flex: 1;
                }

                i {
                    padding: 4px;
                    color: #333;
                    font-size: 16px;
                    border-radius: 100%;
                    cursor: pointer;

                    &:hover {
                        color: #09f;
                        text-decoration: underline;
                    }

                }
            }

            
        }
    }

    main {
        flex: 2.5;
        display: flex;
        flex-direction: column;
        color: #333;
        overflow: auto;
        background-color: #fff;

        header {
            width: 100%;
            padding: 20px 10px 10px;
            box-sizing: border-box;
            -webkit-app-region: drag;

            h1 {
                font-size: 22px;
                font-weight: 400;
                color: #0a0a0a;
                overflow: hidden;
                text-overflow: ellipsis;
                text-transform: capitalize;
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
    margin: 5px 0 0;
    overflow: auto;

    li {
        position: relative;
        display: flex;
        padding: 8px 3px;
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

        .el-icon-error {
            position: absolute;
            top: 50%;
            right: 3px;
            color: #9e9e9e;
            opacity: 0;
            background: #fff;
            transform: translateY(-50%);
            transition: opacity .3s ease-in-out;

            &:hover {
                color: #FF5722;
            }
        }

        &:hover {
            .el-icon-error {
                opacity: 1;
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
            background: #e4e4e4;
            transition: background .3s ease-in-out;

            &::after {
                border-color: transparent;
            }
        }
    }
}

</style>
<style>
.search-box {
    margin: 0 10px 0;
}
    
.apis-view .search-box .el-input__inner {
    background-color: #e4e4e4;
    border: none;
}
</style>

