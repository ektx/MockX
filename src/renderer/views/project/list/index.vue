<template>
    <section class="project-view">
        <div class="drag-bar"></div>
        <header>
            <el-input class="search-box" prefix-icon="el-icon-search" placeholder="输入项目名称" v-model="search" clearable size="mini"/>
            <el-button type="primary" plain class="add-btn" size="mini" @click="showDialog = !showDialog">添加项目</el-button>
        </header>

        <main>
            <ul class="project-list">
                <li v-for="item in data" :key="item._id" @click="goAPIS(item)" @contextmenu.prevent="setMenu(item)">
                    <div class="title">{{item.name}}</div>
                    <div class="subtitle"><span :title="item.updatedAt">{{formatTime(item)}}</span> - {{item.baseUrl}} </div>
                    <p>{{item.description}}</p>
                </li>
            </ul>
        </main>

        <el-dialog :title="dialogTitle" :visible.sync="showDialog">
            <MForm
                v-model="params"
                :rules="rules"
                :data="form"
                :submit="submit"
            />
        </el-dialog>
    </section>
</template>

<script>
import { ipcRenderer, ipcMain, remote } from 'electron'
import path from 'path'

const { Menu, MenuItem } = remote

export default {
    name: 'project-list-view',
    data () {
        return {
            search: '',
            data: [],
            showDialog: false,
            form: [
                {
                    label: '项目名称',
                    key: 'name'
                },
                {
                    label: '项目描述',
                    key: 'description'
                },
                {
                    label: '线上地址',
                    key: 'online'
                }
            ],
            params: {
                name: '',
                description: '',
                online: ''
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: '请输入项目名称',
                        trigger: 'blur'
                    }
                ]
            },
            menu: new Menu(),
            dialogTitle: '添加项目'
        }
    },
    watch: {
        search (newVal) {
            ipcRenderer.send('SEARCH_PROJECTS', newVal)
        }
    },
    mounted () {
        ipcRenderer.send('GET_PROJECTS')

        ipcRenderer.on('SEARCH_PROJECTS_RESULT', (evt, res) => {
            if (res.success) {
                this.data = res.data
            } else {
                this.$message.error(res.message)
            }
        })

        ipcRenderer.on('GET_PROJECTS_RESULT', (evt, res) => {
            if (res.success) {
                this.data = res.data
            } else {
                this.$message.error(res.message)
            }
        })

        ipcRenderer.on('REMOVE_PROJECT_RESULT', (evt, res) => {
            if (res.success) {
               ipcRenderer.send('GET_PROJECTS')
               this.$message.success('删除成功！')
            } else {
                this.$message.error(res.message)
            }
        })

        ipcRenderer.on('UPDATE_PROJECT_RESULT', (evt, res) => {
            if (res.success) {
                ipcRenderer.send('GET_PROJECTS')
                this.$message.success('修改成功！')
            }
        })

    },
    methods: {
        submit (valid) {
            if (valid) {
                this.showDialog = false
                if (this.params._id) {
                    ipcRenderer.send('UPDATE_PROJECT', this.params)
                } else {
                    ipcRenderer.send('SAVE_PROJECT', this.params)
                }
                
                Object.assign(this.params, {name:'', description: ''})
                this.dialogTitle = '添加项目'
            }
        },

        goAPIS (item) {
            // 保存当前项目
            localStorage.project = JSON.stringify(item)
            this.$router.push({name: 'projectApis'})
        },

        setMenu (item) {
            this.menu.clear()
            this.menu.append(new MenuItem({label: '编辑', click: () => {
                this.showDialog = true
                this.dialogTitle = '编辑项目'
                this.params = Object.assign({},item)
            }}))

            this.menu.append(new MenuItem({label: '删除', click: () => {
                
                this.$confirm(`此操作将永久删除 ${item.name} 项目, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    ipcRenderer.send('REMOVE_PROJECT', item)
                }).catch(() => {

                })

            }}))

           this.menu.popup({})
           
        },

        formatTime (item) {
            return this.$moment(item.updatedAt).fromNow().replace(/\s/, '')
        }
    },
    beforeRouteLeave (to, from , next) {
        ipcRenderer.removeAllListeners('GET_PROJECTS_RESULT')
        ipcRenderer.removeAllListeners('REMOVE_PROJECT_RESULT')
        ipcRenderer.removeAllListeners('UPDATE_PROJECT_RESULT')
        ipcRenderer.removeAllListeners('SEARCH_PROJECTS_RESULT')

        next()
    }
}
</script>

<style lang="scss" scoped>
.project-view {
    display: flex;
    height: 100vh;
    flex-direction: column;
    background-color: #fff;

    .drag-bar {
        height: 20px;
        -webkit-app-region: drag;
    }

    header {
        display: grid;
        margin: 0px 20px 20px;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

        .search-box {
            grid-column: 1 / 3;
        }

        .add-btn {
            grid-column: 5 / 5;
        }
    }

    main {
        flex: 1;
        margin: 0 3px 5px 0;
        overflow: auto;
        transform: translate3d(0,0,0);
    }
}

.project-list {
    margin: 0 0 0 20px;

    .title {
        font-size: 16px;
        color: #333;
        transition-property: color;
        transition-duration: .3s;
    }

    .subtitle, p {
        font-size: 12px;
        color: #777;
    }

    li {
        padding: 7px 5px;
        border-bottom: 1px solid rgba(0, 0, 0, .1);
        transition-property: background-color;
        transition-duration: .3s;
        user-select: none;

        &:hover {
            background-color: #f5f5f5;

            .title {
                color: #09f;
            }
        }
    }
}
</style>
