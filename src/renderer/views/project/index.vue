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

