import Vue from 'vue'
import App from './App'
import Element from 'element-ui'
import './assets/js/autoComs.js'

import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Element)

new Vue({
    render: h => h(App)
}).$mount('#app')