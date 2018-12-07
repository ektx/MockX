<template>
    <section class="project-view">
        <header>
            <el-input class="search-box" prefix-icon="el-icon-search" placeholder="输入项目名称" v-model="search" clearable size="mini"/>
            <el-button type="primary" plain class="add-btn" size="mini" @click="showDialog = !showDialog">添加项目</el-button>
        </header>

        <main>
            <ul class="project-list">
                <li v-for="item in data" :key="item._id" @click="goAPIS(item)">
                    <div class="title">{{item.name}}</div>
                    <div class="subtitle">{{item.baseUrl}} <span>{{item.ctime}}</span></div>
                    <p>{{item.description}}</p>
                </li>
            </ul>
        </main>

        <el-dialog title="添加项目" :visible.sync="showDialog">
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
import { ipcRenderer } from 'electron'
import path from 'path'

export default {
    name: 'project-view',
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
                }
            ],
            params: {
                name: '',
                description: ''
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: '请输入项目名称',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    mounted () {
        ipcRenderer.send('GET_PROJECTS')

        ipcRenderer.on('GET_PROJECTS_RESULT', (evt, res) => {
            if (res.success) {
                this.data = res.data
            } else {
                this.$message.error(res.message)
            }
        })

        console.log(this.$router.options)
    },
    methods: {
        submit () {
            this.showDialog = false
            ipcRenderer.send('SAVE_PROJECT', this.params)
            Object.assign(this.params, {name:'', description: ''})
        },

        goAPIS (item) {
            this.$router.push({name: 'projectApis'})

            // 保存当前项目
            localStorage.project = JSON.stringify(item)
        }
    },
    beforeRouteLeave (to, from , next) {
        ipcRenderer.removeAllListeners('GET_PROJECTS_RESULT')

        next()
    }
}
</script>

<style lang="scss" scoped>
.project-view {
    display: flex;
    height: 100vh;
    flex-direction: column;

    header {
        display: grid;
        margin: 20px 20px;
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

        &:hover {
            background-color: #f5f5f5;

            .title {
                color: #09f;
            }
        }
    }
}
</style>
