<template>
    <div class="api-info-box">
        {{data}}
        <h3>
            <span>基础信息</span>
            <i class="el-icon-edit" title="编辑基础信息" @click="editApi"></i>
        </h3>
        <ul-list :data="list" :format="apiFormat"/>

        <h3>
            <span>请求头信息</span>
        </h3>        
        <h3>请求参数信息</h3>
        <h3>
            <span>响应信息</span>
        </h3>
        <div class="radio-list-box">
            <ul class="mock-list-box">
                <li v-for="item in resList" :key="item._id">{{item}}
                    <el-checkbox :value="item.used" @change="resCurrent = item">{{item.name}}</el-checkbox>
                    <i class="el-icon-edit" title="编辑" @click="addNewMock('respinse', false, item._id)"></i>
                </li>
            </ul>
            <div class="setting-box">
                <el-button size="mini" @click="addNewMock('response', true, data._id)">添加</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { ipcRenderer, ipcMain } from 'electron';

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
            list: {},

            resList: {},
            resCheckbox: null,
            resCurrent: null
        }
    },
    computed: {
        ...mapState('server', ['host', 'port'])
    },
    watch: {
        data: {
            handler (val) {
                // 切换api时，重置
                this.resCurrent = null

                // 扩展基础信息
                this.list = Object.assign({}, val, {
                    host: 'http://'+ this.host+':'+this.port,
                    local: 'http://localhost:'+this.port
                })

                // 获取所有的 mocks
                ipcRenderer.send('GET_API_MOCKS', {
                    id: this.data._id
                })
            },
            immediate: true
        },

        resCurrent (val, old) {
            if (!val) return

            if (old) {
                old.used = false
                ipcRenderer.send('UPDATE_API_MOCK', {
                    id: old._id,
                    used: false
                })
            
            }
            
            val.used = true
            ipcRenderer.send('UPDATE_API_MOCK', {
                id: val._id,
                used: val.used
            })
        }
    },
    mounted () {
        ipcRenderer.on('GET_API_MOCKS_RESULT', (evt, res) => {
            if (res.success) {
                this.resList = res.data

                res.data.forEach(item => {
                    if (item.used) this.resCurrent = item
                })
            } else {
                this.$message.error(res.message)
            }
        })
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
        },

        addNewMock (type, isAdd, id) {
            let params = {
                method: type
            }

            if (isAdd) {
                params.id = id
            } else {
                params.mockId = id
            }

            this.$router.push({
                name: 'editMock',
                params
            })
        },

        editMock () {

        }

        // setResCheckBox (item) {
        //     console.log(item)
        //     item.used = true
        // }
    },
    beforeRouteLeave (to, from, next) {
        ipcRenderer.removeAllListeners('GET_API_MOCKS_RESULT')

        next()
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

.mock-list-box {
    li {
        line-height: 32px;
        border-bottom: 1px solid #eee;
    }
}
.setting-box {
    margin: 1em 0;
}
</style>
