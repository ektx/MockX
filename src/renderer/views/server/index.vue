<template>
    <div class="server-view">
        <h1>服务器</h1>
        <p class="info">服务器启动信息(请不要频繁开关你的服务器!)。</p>

        <el-form 
            v-if="!params.status"
            :model="params" 
            :rules="rules" 
            label-width="80px" 
            ref="form"
            size="mini"
            class="my-form"
        >
            <el-form-item label="网址" prop="ipv4">
                <el-input v-model="params.host"/>
            </el-form-item>
            <el-form-item label="端口" prop="port">
                <el-input v-model="params.port"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="loaded" @click="submitForm">启动服务器</el-button>
                <el-button @click="resetForm" :disabled="loaded">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="serve-info" v-else>
            <div class="serve-link">
                <p>本地：<input type="text" :value="`localhost:${params.port}`" readonly></p>
                <p>网络：<input type="text" :value="`${params.host}:${params.port}`" readonly></p>
            </div>
            <el-button :loading="loaded" @click="closeServe" size="mini">关闭服务器</el-button>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState, mapMutations } from 'vuex'
import { getIPv4 } from '../../../common/getIP/index.js'

export default {
    name: 'server-view',
    data () {
        return {
            params: {
                host: '0.0.0.0',
                port: 8200,
                status: false
            },
            loaded: false,
            rules: {
                port: [
                    {
                        required: true,
                        message: '请输入端口',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    computed: {
        ...mapState('server', ['status'])
    },
    watch: {
        params: {
            handler (val) {
                this.setHostInfo(val)
            },
            deep: true
        } 
    },
    async mounted () {
        // 如果已经有状态，且是开启时
        if (this.status) {
            // 更新状态
            this.params.status = this.status
        } else {
            // 设置IP
            this.params.host = await getIPv4()
        }
    
        // 响应启动服务器结果
        ipcRenderer.on('START_SERVE_RESULT', (evt, arg) => {
            this.loaded = !arg
            this.params.status = arg
        })

        // 响应关闭服务器结果 
        ipcRenderer.on('STOP_SERVE_RESULT', (evt, arg) => {
            this.loaded = arg
            this.params.status = arg
        })
    },
    methods: {
        ...mapMutations('server', ['setHostInfo']),

        submitForm () {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.loaded = true
                    ipcRenderer.send('START_SERVE', this.params)
                } else {
                    return false
                }
            })
        },
        resetForm () {
            this.$refs.form.resetFields()
        },
        closeServe () {
            this.loaded = true
            ipcRenderer.send('STOP_SERVE', true)
        }
    },
    beforeRouteLeave (to, from , next) {
        ipcRenderer.removeAllListeners('START_SERVE_RESULT')
        ipcRenderer.removeAllListeners('STOP_SERVE_RESULT')

        next()
    }
}
</script>

<style lang="scss" scoped>
.server-view {
    padding: 1em  2em;

    h1 {
        font-size: 24px;
        font-weight: 400;
        color: #333;
    }

    .info {
        color: #666;
    }

    .my-form {
        width: 400px;
        margin: 20px 0;
    }

    .serve-info {
        margin: 20px 0;

        .serve-link {
            padding: 10px;
            margin-bottom: 20px;
            line-height: 28px;
            border: 1px solid #ffc107;
            border-radius: 2px;
            background: rgba(255, 193, 7, 0.22);
            
            input {
                padding: 2px 5px;
            }
        }
    }
}
</style>
