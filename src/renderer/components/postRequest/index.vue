<template>
    <div class="post-request">

        <div class="url-input">
            <el-input
                placeholder="请输入请求地址"
                v-model="requestParams.url"
                style="width: 93%">

                <el-select v-model="requestParams.type" slot="prepend" placeholder="请选择">
                    <el-option label="POST" value="POST"></el-option>
                    <el-option label="GET" value="GET"></el-option>
                </el-select>
                <el-button slot="append" @click="addParams = !addParams">Params</el-button>

            </el-input>
            <el-button type="primary" @click="send" :loading='loading'>发送</el-button>
        </div>

        <div class="add-params" v-if="addParams">
            <eTable @change='urlParamsChange' :data='urlParams' ref="urlParams"></eTable>
        </div>

        <div class="custom-params">
            <el-tabs v-model="customActiveName">
                <el-tab-pane label="Headers" name="Headers">

                    <eTable @change='(data) => customHeaders=data'></eTable>

                </el-tab-pane>
                <el-tab-pane label="Body" name="Body" :disabled='requestParams.type==="GET"'>

                    <el-radio-group v-model="customBodyType">
                        <el-radio label="form-data">form-data</el-radio>
                        <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
                    </el-radio-group>

                    <eTable @change='(data) => customBodys=data'></eTable>

                </el-tab-pane>
            </el-tabs>
        </div>

        <div class="response" v-loading="loading">
            <el-tabs v-model="responseActiveName" v-if="codeInner">
                <el-tab-pane label="Body" name="Body">
                    <aceCode :options="aceOptions" v-model="codeInner" ref="aceCode"/>
                </el-tab-pane>
                <el-tab-pane label="Cookies" name="Cookies">
                    <el-table
                        :data="cookiesData"
                        stripe
                        style="width: 100%">
                            <el-table-column
                                prop="name"
                                label="Name"
                                width="180">
                            </el-table-column>
                            <el-table-column
                                prop="value"
                                label="Value">
                            </el-table-column>
                            <el-table-column
                                prop="domain"
                                label="Domain">
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="Headers" name="Headers">
                    <p v-for="key in Object.keys(headers)" :key="key">{{key}} ----> {{key==='set-cookie'?headers[key][0]:headers[key]}}</p>
                </el-tab-pane>
            </el-tabs>
        </div>

    </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import { Loading } from 'element-ui';

export default {
    name: 'PostRequest',
    props: {
        name: {
            type: String,
            default: '1'
        },
        chooseName: {
            type: String,
            default: '1'
        }
    },
    data () {
        return {
            requestParams:{
                url:'http://anhaooray.oicp.net:18888/login/doLogin',
                type: 'POST',
                headers: new Object(),
                data: new Object()
            },
            urlParams:[{}],
            customActiveName: 'Headers',
            customHeaders: [],
            customBodys: [],
            customBodyType: 'x-www-form-urlencoded',
            responseActiveName: 'Body',
            aceOptions: {
                mode: 'javascript',
                theme: 'chrome',
                useWorker: false
            },
            codeInner: '',
            cookiesData:[],
            headers:'',
            loading: false,
            addParams: false
        }
    },
    watch: {
        requestParams:{
            handler(newVal) {
               if ( newVal.type === 'GET')  this.customActiveName = 'Headers'
            },
            deep: true
        },
        'requestParams.url'(val){
            this.$emit('urlChange', val)
            const data = []
            if (val.split('?')[1]) {
                const urlParams= val.split('?')[1].split('&');
                urlParams.forEach(element => {
                    data.push({
                        key:element.split('=')[0],
                        value:element.split('=')[1]
                    })
                });
                data.push({})
                this.urlParams = data
            }
        }
    },
    methods: {
        urlParamsChange ( dataJson ) {
            let params = ''
            dataJson && dataJson.forEach( item => {
                if (item.key) {
                    params += '&' + item.key
                    if (item.value) {
                        params += '=' + item.value
                    }
                }
            });
            if (params.substr(1) === '') {
                this.requestParams.url = this.requestParams.url.split('?')[0]
                return false
            }
            this.requestParams.url = this.requestParams.url.split('?')[0] + '?' + ( params.substr(1) )
            this.$emit('urlChange', this.requestParams.url)
        },

        send() {

            if (!this.requestParams.url) {
                this.$message.warning('URL不能为空！')
                return false
            }

            ipcRenderer.removeAllListeners('SEND_REQUEST_RESULT')

            function isJSON(str) {
                if (typeof str == 'string') {
                    try {
                        JSON.parse(str);
                        return true;
                    } catch(e) {
                        return false;
                    }
                }  
            }

            if (this.name === this.chooseName) {
                ipcRenderer.on('SEND_REQUEST_RESULT', (evt, res) => {

                    this.loading = false
                    this.codeInner =  JSON.stringify(JSON.parse(res.data.data), null, 4)
                    this.headers = res.data.res.headers
                    if (res.data.res.headers['set-cookie']) {
                        this.cookiesData=[{
                            name: res.data.res.headers['set-cookie'][0].split('=')[0],
                            value: res.data.res.headers['set-cookie'][0].split('=')[1].split(';')[0],
                            domain: ''
                        }]
                    }
                    
                })
            }
            
            if (this.customHeaders.length>0) {
                this.customHeaders.forEach( item => {
                    if (item.key && item.value) {
                        this.requestParams.headers[item.key] = item.value
                    }
                });
            } else {
                this.requestParams.headers = {}
            }
            
            if (this.customBodys.length>0) {
                this.customBodys.forEach( item => {
                    if (item.key && item.value) {
                        this.requestParams.data[item.key] = item.value
                    }
                });
            } else {
                this.requestParams.data = {}
            }
            
            console.log(this.requestParams)
            this.loading = true
            ipcRenderer.send('SEND_REQUEST', this.requestParams)

        }
    },
    beforeDestroy() {
        ipcRenderer.removeAllListeners('SEND_REQUEST_RESULT')
    }
}
</script>
<style lang='scss' scoped>
.post-request{
    padding: 1em;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
    display: flex;
    flex-direction: column;
    .url-input{
        margin-bottom: 15px;
    }
    /deep/ .el-input-group__prepend{
        width: 60px;
    }
    .response{
        height: calc(100% - 40px);
        .el-tabs,.el-tab-pane{
            height: 100%;
        }
    }
    .el-radio-group{
        margin-bottom: 15px;
    }
}
</style>
