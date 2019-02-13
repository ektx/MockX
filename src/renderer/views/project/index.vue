<template>
    <section class="project-view">
        <router-view></router-view>
    </section>
</template>

<script>
import { ipcRenderer } from 'electron'
import path from 'path'

export default {
    name: 'project-view',
    mounted () {
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
