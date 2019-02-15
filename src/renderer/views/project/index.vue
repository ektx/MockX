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
        this.$router.push({name: this.leavePath})
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
    background-color: #fff;
}
</style>
