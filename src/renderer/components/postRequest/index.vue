<template>
    <div class="post-request">

        <div class="url-input">
            <el-input placeholder="请输入请求地址" v-model="requestParams.url" style="width: 94%">
                <el-select v-model="requestParams.type" slot="prepend" placeholder="请选择">
                    <el-option label="POST" value="POST"></el-option>
                    <el-option label="GET" value="GET"></el-option>
                </el-select>
                <el-button slot="append" @click="addParams = !addParams">Params</el-button>
            </el-input>
            <el-button type="primary" @click="send">发送</el-button>
        </div>

        <div class="add-params" v-if="addParams">
            <Etable :data='urlParams' @urlParamsChange='urlParamsChange'></Etable>
        </div>

        <div class="custom-params">
            <el-tabs v-model="customActiveName">
                <el-tab-pane label="Headers" name="Headers">

                    <Etable :data='customHeaders'></Etable>

                </el-tab-pane>
                <el-tab-pane label="Body" name="Body" :disabled='requestParams.type==="GET"'>

                    <el-radio-group v-model="customBodyType">
                        <el-radio label="form-data">form-data</el-radio>
                        <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
                    </el-radio-group>

                    <Etable :data='customBodys'></Etable>

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
import Etable from '../../components/table'
export default {
    name: 'PostRequest',
    components: {
        Etable
    },
    data () {
        return {
            requestParams:{
                url:'',
                type: 'POST',
                headers: new Object(),
                data: new Object()
            },
            customActiveName: 'Headers',
            customHeaders: [{
                key: 'Content-Type',
                value: 'application/x-www-form-urlencoded'
            }],
            customBodys: [{
                key: 'userName',
                value: 'wangruirui'
            },{
                key: 'password',
                value: 'a11111111'
            }],
            customBodyType: 'form-data',
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
            addParams: false,
            urlParams: [{

            },{

            },]
        }
    },
    watch: {
        requestParams:{
            handler(newVal) {
               if ( newVal.type === 'GET')  this.customActiveName = 'Headers'
            },
            deep: true
        }
    },
    mounted() {

        ipcRenderer.on('SEND_REQUEST_RESULT', (evt, res) => {
            console.log(res)

            this.loading = false
            this.codeInner = (res.data.chunk).replace(/,/g,',\n    ').replace(/{/g,'{\n    ').replace(/},/g,'\n    },')
            this.headers = res.data.res.headers
            this.cookiesData=[{
                name: 'sid',
                value: res.data.res.headers['set-cookie'][0].split('sid=')[1].split(';')[0],
                domain: ''
            }]
            
        })

    },
    methods: {
        urlParamsChange () {

            let params = ''
            this.urlParams.forEach( item => {
                item.key && ( params += '&' + item.key)
                ( item.key && item.value ) && ( params += '=' + item.value )
            });
            this.requestParams.url = this.requestParams.url.split('?')[0] + '?' + ( params.substr(1) )
            
        },

        send() {

            if (!this.requestParams.url) {
                this.$message.warning('URL不能为空！')
                return false
            }

            this.customHeaders.forEach( item => {
                this.requestParams.headers[item.key] = item.value
            });
            this.customBodys.forEach( item => {
                this.requestParams.data[item.key] = item.value
            });
            console.log(this.customHeaders)
            console.log(this.customBodys)
            console.log(this.requestParams.data)

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
    padding-bottom: 0;
    height: 100%;
    box-sizing: border-box;
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
}
</style>
