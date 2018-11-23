<template>
    <section class="database-view">
        <h1>数据库信息</h1>
        <p>你的数据库保存在：<strong>{{path}}</strong></p>

        <el-button size="mini" @click="open">打开目录地址</el-button>
    </section>
</template>

<script>
import os from 'os'
import { shell } from 'electron'

export default {
    name: 'database-view',
    data () {
        return {
            path: os.homedir() + '/mock-x/db/'
        }
    },
    methods: {
        open () {
            shell.showItemInFolder(this.path)
        }
    }
}
</script>

<style lang="scss">
.database-view {
    padding: 20px;

    h1 {
        color: #333;
        font-weight: 400;
        font-size: 28px;
    }

    p {
        margin: 30px 0;
    }
}
</style>
