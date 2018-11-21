<template>
    <div><h1>{{name}}</h1>
        <el-button size="small" round>登录</el-button>
    </div>
</template>


<script>
export default {
    name: 'app',
    data () {
        return {
            name: 'MockX'
        }
    }
}
</script>

