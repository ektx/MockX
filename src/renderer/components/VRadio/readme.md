# VRadio

单选功能

## 使用方式

JavaScript

```javascript
// 具体路径按你存放位置
import { VRadio, VRadioGroup } from '@/components/VRadio'

export default {
  components: {
    VRadio,
    VRadioGroup
  },
  data () {
    return {
      value: '1',
      // 默认 all 选中
      groupVal: '2',
      disabled: false
    }
  },
  methods: {
    changeEvt (data) {
      console.log(data)
    }
  }
  ...
}
```

### VRadio 使用

```html
<!-- disabled 取值示例 -->
<VRadio disabled>标签方式</VRadio>
<VRadio :disabled="disabled">动态布尔值</VRadio>

<!-- change事件 -->
<VRadio @change="changeEvt">change事件</VRadio>

<!-- v-model 方法 -->
<VRadio val="1" v-model="value" @change="changeEvt">全部</VRadio>
```

#### VRadio Props 参数
| 参数 | 类型 | 说明 | 默认值 |
|:---:| --- | --- |:---:|
| v-model | `String Number Boolean` | 绑定内容 | - |
| val | `String Number Boolean` | 默认内容 | - |
| disabled | `Boolean` | 控制按钮是否可以使用 | `false` |

### VRadioGroup 使用

```html
<VRadioGroup 
  class="your-class" 
  v-model="groupVal" 
  @change="changeEvt"
>
  <VRadio val="0">全部</VRadio>
  <VRadio val="1">已完成</VRadio>
  <VRadio val="2">进行中</VRadio>
</VRadioGroup>
```

#### VRadio Props 参数
| 参数 | 类型 | 说明 | 默认值 |
|:---:| --- | --- |:---:|
| v-model | `String Number Boolean` | 绑定内容 | - |
| type | `button-mod(水平按钮)` <br/> `vertical-button-mod(垂直按钮)` | 组的样式 | - |
| disabled | `Boolean` | 控制按钮是否可以使用 | `false` |

## Event 事件

### @change
变化事件，返回变化后的值。