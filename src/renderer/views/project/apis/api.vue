<template>
    <div class="api-info-box">
        <h3>接口基础信息</h3>
        <ul-list :data="list" :format="apiFormat"/>
        <h3>接口请求头信息</h3>
        <h3>接口请求参数信息</h3>
        <h3>接口请求响应信息</h3>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'project-api-info',
    props: {
        data: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            apiFormat: [
                {
                    label: '基础 URL',
                    key: 'url',
                    evt: this.copyUrl
                },
                {
                    label: '项目 URL',
                    key: ['baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: '内网 URL',
                    key: ['local', 'baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: '外网 URL',
                    key: ['host', 'baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: 'Method',
                    key: 'method'
                },
                {
                    label: '描述',
                    key: 'description'
                }
            ],
            list: {}
        }
    },
    computed: {
        ...mapState('server', ['host', 'port'])
    },
    watch: {
        data: {
            handler (val) {
                this.list = Object.assign({}, val, {
                    host: 'http://'+ this.host+':'+this.port,
                    local: 'http://localhost:'+this.port
                })
            },
            immediate: true
        }
    },
    mounted () {
    },
    methods: {
        copyUrl ({value}) {
            navigator.clipboard
                .writeText(value)
                .then(() => {
                    this.$message.success('复制成功')
                })
                .catch(err => {
                    this.$message.error(`Could not copy text: ${err}`)
                })
           
        },
    }
}
</script>

<style lang="scss" scoped>
.api-info-box {
    margin: 0 10px;
}
.mockx-ul-list-mod {
    /deep/ li.url {
        span {
            cursor: pointer;
    
            &:hover {
                color: #09f;
            }
        }
    }
}
</style>
