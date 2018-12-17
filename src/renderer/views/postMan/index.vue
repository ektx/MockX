<template>
    <div class="post-page">
        <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit">
            <el-tab-pane
                :key="item.name"
                v-for="(item, index) in editableTabs"
                :label="item.title"
                :name="item.name"
            >
                
                <PostRequest ref="postReq"></PostRequest>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import PostRequest from '../../components/postRequest';

export default {
    name: 'post-man',
    components: {
        PostRequest
    },
    data () {
        return {
            editableTabsValue: '1',
            editableTabs: [{
            title: 'New Tab',
            name: '1',
            content: 'Tab 1 content'
            }],
            tabIndex: 1
        }
    },
    mounted () {

    },
    methods: {
        handleTabsEdit(targetName, action) {
        if (action === 'add') {
          let newTabName = ++this.tabIndex + '';
          this.editableTabs.push({
            title: 'New Tab',
            name: newTabName,
            content: 'New Tab content'
          });
          this.editableTabsValue = newTabName;
        }
        if (action === 'remove') {
          let tabs = this.editableTabs;
          let activeName = this.editableTabsValue;
          if (activeName === targetName) {
            tabs.forEach((tab, index) => {
              if (tab.name === targetName) {
                let nextTab = tabs[index + 1] || tabs[index - 1];
                if (nextTab) {
                  activeName = nextTab.name;
                }
              }
            });
          }
          
          this.editableTabsValue = activeName;
          this.editableTabs = tabs.filter(tab => tab.name !== targetName);
        }
      }
    }
}
</script>
<style lang='scss' scoped>
.post-page{
    padding: 1em 2em 0 0;
    height: 100%;
    box-sizing: border-box;
    /deep/ .el-tabs__new-tab:focus{
        outline: none;
    }
    .el-tabs{
        height: 100%;
        /deep/ .el-tabs__content{
            height: calc(100% - 56px);
        }
        .el-tab-pane{
            height: 100%;
        }
    }
}
</style>
