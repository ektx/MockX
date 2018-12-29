import Vue from 'vue'
import router from './router/'
import store from './store/'
import App from './App'
import Element from 'element-ui'
import './assets/js/autoComs.js'
import * as moment from 'moment'

import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Element)

Vue.prototype.$moment = moment
moment.locale('zh-cn')

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')