<template>
    <div class="mock-app">
        <aside class="mock-aside-mod">
            <nav class="navs-list">
                <a v-for="nav in navs" :key="nav.icon" :class="nav.classes" @click="setActive(nav)">
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
                    icon: 'app',
                    classes: 'active'
                },
                {
                    label: '服务器',
                    to: '/server',
                    icon: 'browser',
                    classes: ''
                },
                {
                    label: '数据库',
                    to: '/database',
                    icon: 'file',
                    classes: ''
                },
            ],
            current: null
        }
    },
    mounted () {
        document.title = this.name
        this.$router.push('/project/list')
    },
    methods: {
        setActive (nav) {
            if (this.current) {
                this.current.classes = ''
            }
            nav.classes = 'active'
            this.current = nav
            this.$router.push(nav.to)
        }
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