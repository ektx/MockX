<template>
    <div class="mock-app">
        <aside class="mock-aside-mod">
            <nav class="navs-list">
                <a v-for="nav in navs" :key="nav.icon" :class="nav.classes" @click="current = nav">
                    <icon :class="nav.icon"/>
                    <p>{{nav.label}}</p>
                </a>
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
                    to: '/project/list',
                    icon: 'icon-app'
                },
                {
                    label: '服务器',
                    to: '/server',
                    icon: 'icon-browser'
                },
                {
                    label: '数据库',
                    to: '/database',
                    icon: 'icon-file'
                },
            ],
            current: null
        }
    },
    watch: {
        current (val, old) {
            if (old) old.classes = ''

            if (val.classes) val.classes = 'active'
            else this.$set(val, 'classes', 'active')

            this.$router.push(val.to)
        }
    },
    mounted () {
        document.title = this.name
        this.current = this.navs[0]
    },
    methods: {
        
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
    overflow: hidden;

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

        &.active {
            color: #09f;
        }
    }
}
</style>