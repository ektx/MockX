<template>
    <ul class="mockx-ul-list-mod">
        <li v-for="item in format" :key="item.key">
            <label>{{item.label}}: </label>
            <span>{{data[item.key]}}</span>
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
    data () {
        return {

        }
    }
}
</script>

<style lang="scss">
.mockx-ul-list-mod {
    font-size: 13px;
    line-height: 1.7em;

    label: {
        color: #333;
    }
    span {
        color: #666;
        word-break: break-all;
    }
}
</style>

