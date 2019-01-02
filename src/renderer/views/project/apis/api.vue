<template>
    <div class="api-info-box">
        <h3>
            <span>接口基础信息</span>
            <i class="el-icon-edit" title="编辑基础信息" @click="editApi"></i>
        </h3>
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
                    label: '本地访问',
                    key: ['local', 'baseUrl', 'url'],
                    split: '/',
                    evt: this.copyUrl
                },
                {
                    label: '局域网访问',
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

        editApi () {
            this.$parent.addNewAPI = true
            this.$parent.apiData = this.data
            console.log(this.data, this.$parent.apiData)
        }
    }
}
</script>

<style lang="scss" scoped>
.api-info-box {
    margin: 0 10px;
    
    h3 {
        margin: 10px 0;
        border-bottom: 1px solid #eee;

        span {
            font-size: 18px;
            color: #333;
        }

        i {
            float: right;
            margin: 7px 5px 0;
            cursor: pointer;

            &:hover {
                color: #09f;
            }
        }
    }
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
