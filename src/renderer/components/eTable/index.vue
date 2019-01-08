<template>
    <el-table
        :data="data"
        size='small'
        border
        ref="multipleTable"
        @selection-change='selectionChange'
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
                    style="width:96%;"
                    @keyup.native='change'></el-input>
                <i class="el-icon-close" v-if="index%2===1 && data.length>1" @click='delet(scope.$index)'></i>
            </template>
        </el-table-column>
        
    </el-table>
</template>
<script>
export default {
    name: 'Etable',
    props: {
        // data: {
        //     type: Array,
        //     default: () => []
        // },
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
    },
    data () {
        return {
            data: [{}],
            selections: []
        }
    },
    watch: {
        data:{
            handler(value){
                value.forEach( item => {
                    this.$refs.multipleTable.toggleRowSelection( item, true )
                });
            },
            deep: true
        }
    },
    mounted() {
        this.$refs.multipleTable.toggleRowSelection( this.data[0] ,true )
    },
    methods: {
        change () {
            this.$emit("change",this.selections);

            if (this.data.length===1){
                this.data.push({})
            } else if (Object.keys(this.data[this.data.length-1]).length>0){
                this.data.push({})
            }
            
        },
        delet (index) {
            this.data.splice(index,1);
            this.$emit("change");
        },
        selectionChange (selection) {
            this.selections = selection;
            console.log(this.selections)
            this.$emit("change",this.selections);
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
.el-icon-close{
    display: none;
    cursor: pointer;
}
.el-table__row:hover .el-icon-close{
    display: inline-block;
}
</style>
