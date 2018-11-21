<template>
    <div><h1>{{name}}</h1>
        <el-button size="small" round>登录</el-button>
        <icon class="app"/>
    </div>
</template>


<script>
export default {
    name: 'app',
    data () {
        return {
            name: 'MockX'
        }
    },
    mounted () {
        document.title = this.name
    }
}
</script>

<style lang="scss" scoped>
h1 {
    font-size: 12px
}
body {
    background: red
}
</style>
