<template>
    <section class="project-view">
        <header>
            <el-input class="search-box" prefix-icon="el-icon-search" placeholder="输入项目名称" v-model="search" clearable size="mini"/>
            <el-button type="primary" plain class="add-btn" size="mini" @click="showDialog = !showDialog">添加项目</el-button>
        </header>

        {{data}}
        {{params}}

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
    },
    methods: {
        submit () {
            this.showDialog = false
            ipcRenderer.send('SAVE_PROJECT', this.params)
            Object.assign(this.params, {name:'', description: ''})
        }
    }
}
</script>

<style lang="scss" scoped>
.project-view {
    header {
        display: grid;
        margin: 20px 10px;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

        .search-box {
            grid-column: 1 / 3;
        }

        .add-btn {
            grid-column: 5 / 5;
        }
    }
}
</style>
