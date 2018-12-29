<template>
        <el-button @click="open">Login</el-button>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
    name: 'login',
    data () {
        return {
        }
    },
    methods: {
        open () {
            ipcRenderer.send('OPEN_MAIN_WINDOW')
        }
    }
}
</script>

<style lang="scss">
</style>
