
export default {

	/*
		随机生成一个整数
	*/
	integer (min, max) {
		min = min ? parseInt(min, 10) : 0
		max = max ? parseInt(max, 10) : min
		return Math.round(Math.random() * (max - min)) + min
	},

	typeof (obj) {
		if ( obj === null ) {
			return String( obj )
		}

		return typeof obj === 'object' || typeof obj === 'function' 
			? Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() || 'object' 
			: typeof obj
	}
}