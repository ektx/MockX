<template>
    <section class="database-view">
        <header>
            <el-button icon="el-icon-caret-right" circle @click="run"></el-button>
        </header>
        <main>
            <aside>
                <p 
                    v-for="item in dbList"
                    :key="item.name"
                    :class="['db-list-box',{current: item.status}]"
                    @click="currentDB = item"
                >{{item.name}}</p>
            </aside>
            <section class="content-box">
                <aceCode class="query-box" v-model="aceSetVal"></aceCode>

                <div class="result-box">
                    <div class="result-header">
                        NeDB: {{currentDB.name}}
                    </div>
                    <aceCode class="result-code-box" v-model="dbResult" :options="resultOpt"></aceCode>
                </div>
            </section>
        </main>
        <footer>
            <span title="打开数据库目录" @click="open"><i class="el-icon-location"/>{{path}}</span>
        </footer>
    </section>
</template>

<script>
import os from 'os'
import fs from 'fs'
import { shell } from 'electron'

const dbPath = os.homedir() + '/mock-x/db/'

export default {
    name: 'database-view',
    data () {
        return {
            path: dbPath,
            dbList: [],
            currentDB: {},
            aceSetVal: '',
            dbResult: '',
            resultOpt: {
                readOnly: true,
                showLineNumbers: false,
                showGutter: false
            }
        }
    },
    watch: {
        currentDB (val, old) {
            if (old) {
                old.status = false
            }

            val.status = true
        }
    },
    mounted () {
        this.dbList = []
        fs.readdirSync(this.path).forEach(item => {
            if (item.endsWith('.db')) {
                this.dbList.push({
                    name: item.slice(0, -3),
                    status: false
                })
            }
        })

        this.currentDB = this.dbList[0]
    },
    methods: {
        open () {
            shell.showItemInFolder(this.path)
        },

        run () {
            console.log(this.aceSetVal)
        }
    }
}
</script>

<style lang="scss">
.database-view {
    display: flex;
    height: 100%;
    flex-direction: column;
    overflow: hidden;

    header {
        padding: 0 12px;
        height: 56px;
        line-height: 60px;
        -webkit-app-region: drag;

        .el-icon-caret-right {
            padding: 0px;
            font-size: 20px;
        }
        .el-button.is-circle {
            padding: 6px;
        }
    }

    main {
        flex: 1;
        display: flex;
        overflow: hidden;

        aside {
            width: 200px;
            overflow: auto;
            background: rgba(0, 0, 0, .07);
        }
        .content-box {
            flex: 1;
            background: #fff;

            .query-box {
                height: 20vh;
            }
            .result-box {
                height: 80vh;
            }
        }
    }
    
    footer {
        height: 24px;
        line-height: 24px;

        span {
            display: inline-block;
            max-width: 100%;
            font-size: 12px;
            color: #666;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            
            .el-icon-location {
                color: #ccc;
            }

            &:hover {
                user-select: none;
                color: #333;
                cursor: pointer;

                .el-icon-location {
                    color: #F56C6C;
                }
            }
        }
    }
}

.db-list-box {
    padding: 0 5px;
    color: #333;
    font-size: 14px;
    line-height: 2em;
    cursor: pointer;

    &.current {
        background: #ccc;
    }
}

.result-header {
    padding: 0 5px;
    font-size: 10px;
    line-height: 2em;
    color: #333;
    text-transform: uppercase;
    user-select: none;
}
</style>
