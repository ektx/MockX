export default {
    namespaced: true,
    state: {
        host: '0.0.0.0',
        port: 8200,
        // 服务器 关闭中
        status: false
    },
    mutations: {
        setHostInfo (state, data) {
            Object.assign(state, data)
        }
    }
}