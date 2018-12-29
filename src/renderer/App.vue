<template>
    <div class="mock-app">
            <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: 'app',
    data () {
        return {
            name: 'MockX',
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
