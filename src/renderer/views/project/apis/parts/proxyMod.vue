<template>
    <div class="proxy-mod">
        <div class="headers-box">
            <h3>
                <span>代理</span>
                <i class="el-icon-plus" title="添加" @click="addNewProxy"></i>
            </h3>
            <div v-if="list.length">
                <p>开启代理: <el-switch v-model="api.usedProxy.open" @change="proxyEvt" /></p>
                <p>{{list[api.usedProxy.index]}}</p>
                <VRadioGroup 
                    v-model="api.usedProxy.index" 
                    :disabled="!api.usedProxy.open"
                    @change="proxyEvt"
                    type="vertical-button-mod"
                >
                    <VRadio 
                        v-for="(item, index) in list" 
                        :key="index" 
                        :val="index"
                    >
                        <p>{{item.title}}</p>
                        <p>{{item.url}}</p>
                        <button @click="delProxy(item, index)">remove</button>
                    </VRadio>
                </VRadioGroup>
            </div>
            <div v-else>
                你还没有添加代理，你可以点击 + 来添加代理。
            </div>
        </div>

        <el-dialog :title="title" :visible.sync="proxyDialog">
            <MForm
                :data="formList"
                v-model="params"
                labelPosition="top"
                :rules="rules"
                :submit="submit"
            />
        </el-dialog>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
    name: 'pro-api-proxy-mod',
    props: {
        project: {
            type: Object
        },
        api: {
            type: Object
        }
    },
    data () {
        return {
            proxyDialog: false,
            proxyData: {},
            currentProxy: '',
            
            title: '代理设置',
            formList: [
                {
                    label: '标题',
                    key: 'title',
                    type: 'input'
                },
                {
                    label: '地址',
                    key: 'url',
                    type: 'input'
                }
            ],
            params: {
                title: '',
                url: ''
            },
            rules: {
                url: [{
                    required: true,
                    message: '地址不能为空'
                }]
            },

            removeIndex: -1
        }
    },
    watch: {
        'api.usedProxy': {
            handler (val) {
                if (this.proxyChange) {
                    ipcRenderer.send('SET_API_USEDPROXY', {
                        _id: this.api._id,
                        ...val
                    })

                    // reset value
                    this.proxyChange = false
                }
            },
            deep: true
        }
    },
    computed: {
        list () {
            return this.api.proxyList || []
        }
    },
    mounted () {
        ipcRenderer.on('API_ADD_NEW_PROXY_RESULT', (evt, res) => {
            if (res.success) {
                this.proxyDialog = false
                this.list.push(this.params)
            } else {
                this.$message.error(res.data)
            }
        })
        
        ipcRenderer.on('REMOVE_API_PROXY_RESULT', (evt, res) => {
            if (res.success) {
                this.$message.success('删除成功')
                this.list.splice(this.removeIndex, 1)
            } else {
                this.$message.error(res.data)
            }
        })

        ipcRenderer.on('SET_API_USEDPROXY_RESULT', (evt, res) => {
            if (res.success) {
                this.$message.success('设置成功')
            } else {
                this.$message.error(res.data)
            }
        })
    },
    methods: {
        addNewProxy () {
            let online = this.project.online || ''

            this.proxyDialog = true
            this.title = '添加代理'
            this.params = {
                title: '',
                url: online + this.api.url,
                _id: this.api._id
            }
        },

        submit (status) {
            if (status) {
                ipcRenderer.send('API_ADD_NEW_PROXY', this.params)
            } else {
                this.$message.error('表单出错')
            }
        },

        delProxy (item, index) {
            this.removeIndex = index

            ipcRenderer.send('REMOVE_API_PROXY', {
                _id: this.api._id,
                ...item
            })
        },

        proxyEvt (evt) {
            this.proxyChange = true
        }
    }
}
</script>
