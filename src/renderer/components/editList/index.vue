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
                        <i class="el-icon-error" @click="remove(ci, col)"></i>
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
            // 显示对象
            myData: [],
            // 用于更新父级数据
            update: false,
            // 验证对象 存储头部唯一键值对
            uniqueObj: {}
        }
    },
    watch: {
        value: {
            handler (val, old) {
                console.log('WATCH value')
                let errClass = 'error'
                // 如果是更新，则value的变化是由编辑导致的
                // 不进行数据处理工作
                if (this.update) {
                    // 修改状态，返回
                    this.update = false
                    return
                }

                this.myData = []
                this.getUniqueObj()

                val.forEach((item, index) => {
                    item = {
                        ...item,
                        classes: '',
                        // 数据唯一ID
                        _id: index 
                    }

                    // 1.更新显示对象
                    this.myData.push(item)

                    // 2.更新验证对象
                    // 2.1 遍历item所有的内容
                    for (let key in item) {
                        // 确认要保持唯一的key
                        if (key in this.uniqueObj) {
                            let currentUnique = this.uniqueObj[key][item.key]
                            // 如果已经存在 当前字段(item.key)
                            // 我们追加一个
                            if (item.key in this.uniqueObj[key]) {
                                // 设置为错误样式
                                // 因为验证对象中只能有一个元素，不能有相同
                                item.classes = errClass
                                // 添加进对象
                                currentUnique.push(item)
                                // 设置之前添加的元素也为错误
                                if (currentUnique[0].classes !== errClass) {
                                    currentUnique[0].classes = errClass
                                }
                            }
                            // 如果没有 我们添加一个 
                            else {
                                this.uniqueObj[key][item.key] = [item]
                            }
                        }
                    }

                })
            },
            immediate: true
        },
        myData: {
            handler (val, old) {
                console.log('WATCH myData')
                // 设置为更新中
                this.update = true
                let filter = []
                // 获取要显示的内容
                this.header.forEach(item => {
                    filter.push(item.key)
                })

                let result = val.map(item => {
                    // 过滤无用的内容
                    return JSON.parse(JSON.stringify(item, filter))
                })
                this.$emit('input', result)
            },
            deep: true
        }
    },
    methods: {
        /**
         * @param {string} val 输入值
         * @param {object} column 当前对象
         * @param {object} item 当前header
         * @param {number} columnIndex 
         */
        setIntVal (val, column, item, columnIndex) {
            // console.log('SETINTVAL EVT')
            // 如果需要唯一验证
            if (Reflect.has(this.uniqueObj, item.key)) {
                let oldVal = column[item.key]
                let currentUnique = this.uniqueObj[item.key]

                // 删除旧内容
                if (oldVal in currentUnique) {
                    let oldKeySize = currentUnique[oldVal].length
                    if (oldKeySize > 1) {
                        currentUnique[oldVal].forEach((oldItem, oldIndex) => {
                            // 如果当前数组中有2个以上
                            // 那我们只能移除自己的警告
                            // 因为还有其它的是相同的
                            if (oldKeySize > 2) {
                                // 移除警告或错误样式
                                column.classes = ''
                            } 
                            // 
                            else {
                                oldItem.classes = ''
                            }

                            // 通过_id我们移除当前的对象
                            if (oldItem._id === column._id) {
                                currentUnique[oldVal].splice(oldIndex,1)
                            }
                        })
                    } else {
                        this.$delete(currentUnique, oldVal)
                    }
                }
                
                // 添加
                // 查询在 uniqueObj 是否存在
                if (val in currentUnique) {
                    currentUnique[val].push(column)

                    currentUnique[val].forEach(data => {
                        data.classes = 'error'
                    })
                } else {
                    currentUnique[val] = [column]
                }
            }

            // 设置值
            column[item.key] = val
        },

        remove (index, column) {
            // console.log('REMOVE EVT')
            this.update = true
            this.myData.splice(index, 1)
            // 删除验证对象
            for (let key in column) {
                // 确认要保持唯一的key
                if (key in this.uniqueObj) {
                    let currentUnique = this.uniqueObj[key][column.key]
                    // 如果已经存在 当前字段(column.key)
                    if (column.key in this.uniqueObj[key]) {
                        let size = this.uniqueObj[key][column.key].length
                        if (size > 1) {
                            currentUnique.forEach((d, i) => {
                                // 处理样式
                                if (size === 2) {
                                    d.classes = ''
                                }

                                // 删除元素
                                if (d._id === column._id) {
                                    currentUnique.splice(i, 1)
                                }
                            })
                        } else {
                            this.$delete(this.uniqueObj[key], column.key)
                        }
                    }
                }
            }
        },
        // 收集键值对
        getUniqueObj () {
            this.uniqueObj = {}
            this.header.forEach(item => {
                // 如果当前对象是要求为唯一的
                if (item.unique) {
                    this.$set(this.uniqueObj, item.key, {})
                }
            })
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
                    color: #F44336
                }
            }
            
            &:hover {
                background-color: #eee;

                .el-icon-error {
                    opacity: 1;
                }
            }

            &.error {
                border-bottom: 1px solid #F44336;
                background: #f4433621;
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
