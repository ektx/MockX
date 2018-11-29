
import base from './base.js'
import string from './string.js'
import object from './object.js'
import number from './number.js'

function arrayFun(rules) {

	let allResult = []

	rules.forEach((val, i) => {

		let tem
		let min = val.min || 0
		let max = val.max || min
		let size = base.integer(min, max)

		for (let i = 0; i < size; i++) {

			tem = getTypeData( base.typeof(val.data), val.data )

			allResult.push( tem )
		}

	})

	return allResult
}

export default arrayFun

/*
	获取对应类型的数据
	@type [string] 类型
*/
function getTypeData (type, data) {

	let tem

	switch (type) {
		case 'string':
			tem = string( data )
			break

		case 'array':

			if (data.hasOwnProperty('type')) {
				tem = getTypeData( data.type, data )
			} else {
				tem = arrayFun( data )
			}
			break

		case 'number':

			if (data.hasOwnProperty('type')) {
				// 删除 type 防止出错
				delete data.type
				tem = getTypeData( 'number', data )
				// 恢复 type 的原因是因为给后面的规则可以正常使用
				data.type = 'number'
			} else {
				tem = number( data )
			}
			break

		case 'object':
			tem = object(data)
			break;

		default:
			tem = ''
	}

	return tem	
}

