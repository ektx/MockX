<template>
    <div class="project-info-box">
        <ul-list :format="listFormat" :data="data"/>
    </div>
</template>

<script>
export default {
    name: 'apis-project-info-box',
    props: {
        data: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            listFormat: [
                {
                    label: '项目名称',
                    key: 'name'
                },
                {
                    label: '项目编号',
                    key: 'baseUrl'
                },
                {
                    label: '线上地址',
                    key: 'online'
                },
                {
                    label: '项目说明',
                    key: 'description'
                },
                {
                    label: '创建时间',
                    key: 'createdAt'
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.project-info-box {
    margin: 0 10px;
}
</style>
