<template>
    <section class="project-view">
        <keep-alive>
            <router-view />
        </keep-alive>
    </section>
</template>

<script>
export default {
    name: 'project-view',
    data () {
        return {
            leavePath: ''
        }
    },
    mounted () {
        this.$router.push({name: 'projectList'})
    },
    activated () {
        let name = this.leavePath

        if (this.leavePath === 'project') {
            name = 'projectList'
        }
        this.$router.push({name})
    },
    beforeRouteUpdate(to, from, next) {
        // 访问project页面
        if (to.name === 'project') {
            // 除来至列表的页面，都转到列表页
            if (from.name === 'projectList') {
                next(false)
            } else {
                next(false)
                this.$router.push({name: 'projectList'})
            }
        } else {
            next()
        }
    },
    beforeRouteLeave (to, from, next) {
        this.leavePath = from.name
        next()
    }
}
</script>

<style lang="scss" scoped>
.project-view {
    width: 100%;
    overflow: hidden;
}
</style>
