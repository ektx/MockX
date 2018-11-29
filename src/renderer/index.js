import Vue from 'vue'
import router from './router/'
import store from './store/'
import App from './App'
import Element from 'element-ui'
import './assets/js/autoComs.js'

import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Element)

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')