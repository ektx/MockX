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

<style lang="scss">
@import './assets/css/reset-1.4.0.css';

body {
    width: 100vw;
    height: 100vh;
}
</style>
