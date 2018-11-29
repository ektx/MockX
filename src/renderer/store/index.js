import Vue from 'vue'
import Vuex from 'vuex'

import server from '../views/server/store'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    modules: {
        server
    }
})
