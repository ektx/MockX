# editList

```html
<editList :header="tableHeader" v-model="data"/>
```

```js
export default {
    data () {
        return {
            data: [],
            tableHeader: [
                {
                    label: '参数',
                    key: 'key',
                    // unique 表示 参数不允许重复
                    unique: true,
                    type: 'input'
                },
                {
                    label: '类型',
                    key: 'type',
                    type: 'select',
                    options: [
                        {
                            label: '字符串',
                            value: 'string'
                        },
                        {
                            label: '数字',
                            value: 'number'
                        }
                    ]
                },
                {
                    label: '必填',
                    key: 'required',
                    type: 'select',
                    options: [
                        {
                            label: '是',
                            value: true
                        },
                        {
                            label: '否',
                            value: false
                        }
                    ]
                },
                {
                    label: '描述',
                    key: 'description',
                    type: 'input'
                }
            ],
        }
    }
}
```

# props

- header 表头，数组
- value 内容，数组