<template>
    <div class="mock-app">
        <aside class="mock-aside-mod">
            <nav class="navs-list">
                <router-link v-for="nav in navs" :key="nav.icon" :to="nav.to">
                    <icon :class="nav.icon"/>
                    <p>{{nav.label}}</p>
                </router-link>
            </nav>
        </aside>
        <main class="mock-main-display">
            <router-view></router-view>
        </main>
    </div>
</template>


<script>
export default {
    name: 'app',
    data () {
        return {
            name: 'MockX',
            navs: [
                {
                    label: '项目',
                    to: '/',
                    icon: 'app'
                },
                {
                    label: '服务器',
                    to: '/server',
                    icon: 'browser'
                },
            ]
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

<style lang="scss" scoped>
.mock-app {
    display: flex;
    width: 100vw;
    height: 100vh;

    aside {
        width: 70px;
        height: 100vh;
        background-color: #eee;
    }

    main {
        flex: 1;
    }
}

.navs-list {
    margin: 20px 0;
    user-select: none;
    
    a {
        display: block;
        margin: 0 0 20px;
        width: 100%;
        color: #666;
        text-align: center;

        i {
            font-size: 24px;
        }
        p {
            margin: 5px 0 0;
        }

        &.router-link-exact-active {
            color: #09f;
        }
    }
}
</style>