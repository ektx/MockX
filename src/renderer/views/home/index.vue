<template>
    <div class="home-view"></div>
</template>


<script>
export default {
    name: 'home',
    data () {
        return {
        
        }
    },
    mounted () {
        this.$router.push('/project/list')
    }
}
</script>
