<template>
    <section class="edit-list-com">
        <div class="edit-list-content">
            <header>
                <div 
                    class="header-row"
                    v-for="item in header"
                    :key="item.key"
                >
                    {{item.label}}
                </div>
            </header>
            <main>
                <template v-show="myData.length">
                    <div 
                        v-for="(col, ci) in myData" 
                        :key="ci" 
                        :class="['main-column', col.classes]"
                    >
                        <div 
                            v-for="item in header" 
                            :key="item.key"
                            class="main-row"
                        >
                            <el-input
                                v-if="item.type === 'input'" 
                                size="mini"
                                placeholder="请输入内容"
                                :value="col[item.key]"
                                @input="setIntVal($event, col, item, ci)"
                            />
                            <el-select 
                                v-else-if="item.type === 'select'" 
                                v-model="col[item.key]" 
                                size="mini"
                                placeholder="请选择"
                            >
                                <el-option
                                v-for="opt in item.options"
                                :key="opt.value"
                                :label="opt.label"
                                :value="opt.value"/>
                            </el-select>
                        </div>
                        <i class="el-icon-error" @click="remove(ci)"></i>
                    </div>
                </template>
                <div v-show="!myData.length" class="empty">
                    没有数据
                </div>
            </main>
        </div>
    </section>
</template>

<script>
export default {
    name: 'edit-list',
    props: {
        header: {
            type: Array,
            default: () => []
        },
        value: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            myData: [],
            // 警告 无
            warnStatus: false,
            // 错误 无
            errorStatus: false,
            checkEvt: null,
            // 用于更新父级数据
            update: false,
        }
    },
    watch: {
        value: {
            handler (val, old) {
                // 如果是更新中
                // 不进行数据处理工作
                if (this.update) {
                    // 修改状态，返回
                    this.update = false
                    return
                }

                this.myData = []
                val.forEach(item => {
                    this.myData.push({
                        ...item,
                        classes: ''
                    })
                })
            },
            immediate: true
        },
        myData: {
            handler (val, old) {
                // 设置为更新中
                this.update = true
                this.$emit('input', val)
            },
            deep: true
        } 
    },
    methods: {
        setIntVal (val, column, item, columnIndex) {
            column[item.key] = val
            
            // 防止多次调用
            clearTimeout(this.checkEvt)
            this.checkEvt = setTimeout(() => {
                this.checkInputSiblings(val, column, item, columnIndex)
            }, 500)
        },

        checkInputSiblings (val, column, item, columnIndex) {
            this.warnStatus = false

            // 如果当前元素是唯一字段
            // 我们遍历所有数据，为相同的内容显示警告
            if (Reflect.has(item, 'unique')) {
                this.myData.forEach((it, index) => {
                    // 过滤自己
                    if (index !== columnIndex) {
                        if (it[item.key] === val) {
                            it.classes = 'warn'
                            this.warnStatus = true
                        } else {
                            it.classes = ''
                        }
                    }
                })
            }

            column.classes = this.warnStatus && 'warn' 
        },

        remove (index) {
            this.myData.splice(index, 1)
        }
    }
}
</script>

<style lang="scss">
.edit-list-com {
    header {
        display: flex;
        padding: 0 16px 0 0;
        border-bottom: 1px solid #eee;

        .header-row {
            flex: 1;
            padding: 0 5px;
            font-size: 1rem;
            font-weight: bolder;
            color: #999;
            line-height: 3em;
            user-select: none;
        }
    }
    main {
        .main-column {
            display: flex;
            position: relative;
            padding: 0 16px 0 0;
            border-bottom: 1px solid #eee;
            transition: 
                border .3s ease-in-out,
                bacground .3s ease-in-out;

            .main-row {
                flex: 1;
                padding: 3px;

                /deep/ .el-input__inner {
                    padding: 0 5px;
                    font-size: 1rem;
                    border-color: transparent;
                    background-color: transparent;

                    &:focus{
                        border-color: #dcdfe6;
                        background-color: #fff;
                    }
                }
            }

            .el-icon-error {
                position: absolute;
                right: 3px;
                top: 50%;
                font-size: 12px;
                color: #999;
                opacity: 0;
                transform: translateY(-50%);
                transition: opacity .3s ease-in-out;
                cursor: pointer;

                &:hover {
                    color: #F56C6C
                }
            }
            
            &:hover {
                background-color: #eee;

                .el-icon-error {
                    opacity: 1;
                }
            }

            &.warn {
                border-bottom: 1px solid #FFC107;
                background: #ffeb3b14;
            }
        }

        .empty {
            color: #999;
            text-align: center;
            line-height: 5em;
            user-select: none;
            border-bottom: 1px solid #eee;
        }
    }
}
</style>
