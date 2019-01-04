<template>
    <ul class="mockx-ul-list-mod">
        <li 
            v-for="(item, index) in result" 
            :key="index" 
            :class="item.key"
            @click="click(item)"
        >
            <label>{{item.label}}</label>
            <span>{{item.value}}</span>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'ul-list',
    props: {
        format: {
            type: Array,
            default: []
        },
        data: {
            type: Object,
            default: null
        }
    },
    watch: {
        data: {
            handler (val) {
                this.formatData(val)
            },
            immediate: true
        }
    },
    data () {
        return {
            result: null
        }
    },
    methods: {
        formatData () {
            this.result = this.format.map(val => {
                if (Array.isArray(val.key)) {
                    let _v = ''
                    val.key.forEach(k => {
                        // 防止第一个为 /
                        _v += (_v ? val.split : '') + this.data[k]
                    })
                    val.value = _v
                } else {
                    val.value = this.data[val.key]
                }

                return val
            })
        },

        click (item) {
            if (item.evt) item.evt(item)
        }
    }
}
</script>

<style lang="scss">
.mockx-ul-list-mod {
    margin: 10px 0;
    font-size: 13px;
    line-height: 1.5em;

    li {
        margin-bottom: 1em;
    }

    label {
        display: block;
        color: #333;
        font-size: 14px;
        margin-right: 5px;
    }
    span {
        color: #606060;
        word-break: break-all;
    }
}
</style>

