<template>
    <section class="apis-view">
        <aside>
            <header>
                <el-input 
                    class="search-box" 
                    placeholder="Search: API" 
                    v-model="search" 
                    clearable 
                    size="mini"
                >
                    <el-button slot="append" icon="el-icon-plus" @click="addApi"></el-button>
                </el-input>
            </header>
            <ul class="apis-list">
                <li 
                    v-for="api in list" 
                    :key="api._id" 
                    :class="api.classes"
                    @click="current = api"
                >
                    <div class="url">{{api.url}}</div>
                    <div>
                        <span :class="['method',api.method]">{{api.method}}</span>
                        <span class="mock-type">{{api.mockType}}</span>
                    </div>
                </li>
            </ul>
        </aside>
        <main>
            <ul class="api-info">
                <li 
                    v-for="(item, index) in apiFormat"
                    :key="index"
                >
                    <label>{{item.label}}: </label>
                    <span>{{item.value}}</span>
                </li>
            </ul>
            <codeMirror v-model="current.mock" :option="codeOption"/>
        </main>
    </section>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
    name: 'apis-view',
    components: {
    },
    data () {
        return {
            search: '',
            list: [],
            current: {},
            apiFormat: [
                {
                    label: 'Request URL',
                    key: ['baseUrl', 'url']
                },
                {
                    label: 'Request Method',
                    key: 'method'
                }
            ],
            // 代码显示配置
			codeOption: {
				lineNumbers: false,
				readOnly: true,
				mode: 'javascript'
            }
        }
    },
    watch: {
        current (val, old) {
            if ('classes' in old) old.classes = ''

            if ('classes' in val) {
                val.classes = 'hold'
            } else {
                this.$set(val, 'classes', 'hold')
            }

            this.formatData()
        }
    },
    mounted () {
        this.getAPIs()

        ipcRenderer.on('GET_ALL_APIS_RESULT', (evt, res) => {
            if (res.success) {
                this.list = res.data
                this.current = this.list[0]
            } else {
                this.$message.error(res.message)
            }
        })
    },
    methods: {
        addApi () {
            this.$router.push({
                name: 'addApi',
                params: this.$route.params
            })
        },

        getAPIs () {
            ipcRenderer.send('GET_ALL_APIS', {
                id: this.$route.params._id
            })
        },

        formatData () {
            this.apiFormat.forEach(item => {
                if (Array.isArray(item.key)) {
                    item.value = []

                    item.key.forEach(keyItem => {
                        item.value.push(this.current[keyItem])
                    })

                    item.value = item.value.join('/')
                } else {
                    item.value = this.current[item.key]
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.apis-view {
    display: flex;
    width: 100%;
    height: 100vh;

    aside {
        display: flex;
        flex-direction: column;
        width: 230px;
        height: 100%;
        border-right: 1px solid #eee;

        header {
            margin: 10px 5px;
        }
    }

    main {
        flex: 2.5;
    }
}

.apis-list {
    flex: 1;
    overflow: auto;
    border-top: 1px solid #eee;

    li {
        padding: 8px 5px;
        font-size: 11px;
        border-bottom: 1px solid #eee;

        .url {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }

        .method {
            text-transform: uppercase;

            &.post {
                color: #09f;
            }
            &.get {
                color: yellowgreen;
            }
        }

        .mock-type {
            margin: 0 0 0 5px;
            color: #666;
            text-transform: uppercase;
        }

        &.hold {
            background: #f1f1f1;
        }
    }
}

</style>
