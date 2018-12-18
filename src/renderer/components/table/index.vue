<template>
    <el-table
        :data="data"
        size='small'
        border
        style="width: 100%">
        <el-table-column
            type="selection"
            align='center'
            width="55">
        </el-table-column>
        <el-table-column
            v-for="(item,index) in columns"
            :key="index"
            :prop='item.prop'
            :label='item.label'>
            <template slot-scope="scope">
                <el-input
                    size='mini'
                    v-model="scope.row[item.prop]"
                    :placeholder="index%2===0?'New key':'Value'"
                    @keyup.native='$emit("urlParamsChange")'></el-input>
            </template>
        </el-table-column>
        
    </el-table>
</template>
<script>
export default {
    name: 'Etable',
    props: {
        data: {
            type: Array,
            default: () => [{}]
        },
        columns: {
            type: Array,
            default: () => [{
                prop: 'key',
                label: 'Key'
            },{
                prop: 'value',
                label: 'Value'
            },]
        }
    }
}
</script>
<style lang='scss' scoped>
.el-input{
    & /deep/ .el-input__inner{
        border-color: transparent;
        background-color: transparent;
        padding: 0;
        &:focus{
            border-color: #dcdfe6;
            background-color: #fff;
        }
    }
}
</style>
