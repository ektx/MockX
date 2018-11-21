<template>
    <div class="server-view">
        <h1>服务器</h1>
        <p class="info">服务器启动信息(请不要频繁开关你的服务器!)。</p>

        <el-form 
            v-if="!serve"
            :model="params" 
            :rules="rules" 
            label-width="80px" 
            ref="form"
            size="mini"
            class="my-form"
        >
            <el-form-item label="网址" prop="ipv4">
                <el-input v-model="params.ipv4"/>
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
                <p>网络：<input type="text" :value="`${params.ipv4}:${params.port}`" readonly></p>
            </div>
            <el-button :loading="loaded" @click="closeServe" size="mini">关闭服务器</el-button>
        </div>
    </div>
</template>

<script>
import os from 'os'
import { ipcRenderer, ipcMain } from 'electron'

export default {
    name: 'server-view',
    data () {
        return {
            serve: false,
            params: {
                ipv4: '0.0.0.0',
                port: 8200,
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
    mounted () {
        this.params.ipv4 = os.networkInterfaces().en0[1].address

        // 响应启动服务器结果
        ipcRenderer.on('start-serve-result', (evt, arg) => {
            this.loaded = !arg
            this.serve = arg
        })

        // 响应关闭服务器结果 
        ipcRenderer.on('stop-serve-result', (evt, arg) => {
            this.loaded = arg
            this.serve = arg
        })
    },
    methods: {
        submitForm () {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.loaded = true
                    ipcRenderer.send('start-serve', this.params)
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
            ipcRenderer.send('stop-serve', true)
        }
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
