import base from './base.js'
import object from './object.js'

function arr (rules) {
	let min = rules.min || 0
	let max = rules.max || min
	let size = base.integer(min, max)

	switch (base.typeof(rules.data)) {
		case 'string':
			return setStr(rules, size)
		case 'number':
			return setNum(rules, size)
		case 'array':
			return setArr(rules, size)
		case 'object':
			return setObj(rules, size)
	}
}

export default arr

function setStr (rules, size) {

	let arr = []
	if (Reflect.has(rules, 'step')) {
		let tem = 0
		for (let i = 0; i < size; i++) {
			tem += rules.step
			arr.push(rules.data + tem)
		}
	} else {
		for (let i = 0; i < size; i++) {
			// 如果string的规则中，有step功能
			arr.push(rules.data)
		}
	}

	return arr
}

function setNum (rules, size) {
	let arr = []
	if (Reflect.has(rules, 'step')) {
		let tem = rules.data

		for (let i = 0; i < size; i++) {
			arr.push(tem)
			tem += rules.step
		}		
	} else {
		for (let i = 0; i < size; i++) {
			arr.push(rules.data)
		}
	}

	return arr
}

function setArr (rules, size) {
	let arr = []
	let l = rules.data.length -1

	for (let i = 0; i < size; i++) {
		let tem = rules.data[base.integer(0, l)]

		if (typeof tem === 'object') {
			// 如果 tem 是数组直接返回，是对象，我们继续生成
			if (Array.isArray(tem)) {
				arr.push(tem)
			} else {
				if (Reflect.has(tem, 'type')) {
					arr.push( object(tem) )
				} else {
					arr.push(tem)
				}
			}
		} else {
			arr.push(tem)
		}
	}
	return arr
}

function setObj (rules, size) {
	let arr = []
	if (Reflect.has(rules.data, 'type')) {
		arr = makeObjStr(rules, size)
	} else {
		for (let i = 0; i < size; i++) {
			arr.push(rules.data)
		}
	}

	return arr
}

/**
 * 对字符串对象进行生成
 * @param {object} rules 对象方法
 * @param {number} size 生成个数 
 */
function makeObjStr (rules, size) {
	let arr = []
	// step 对象
	let stepObj = {}
	// 有step
	let hasStep = false

	for (let key in rules.data.data) {
		if (Reflect.has(rules.data.data[key], 'step')) {
			// 如果有开始值
			if (Reflect.has(rules.data.data[key], 'start')) {
				// 我们先去1，保持从用户期望的开始
				rules.data.data[key].start--
			} else {
				// 如果没有，我们设置默认为 0
				rules.data.data[key].start = 0
			}

			stepObj[key] = rules.data.data[key]
			hasStep = true
		}
	}
	
	for (let i = 0; i < size; i++) {
		// 有step的对象，我们每次都要动态更新对象
		if (hasStep) {
			let _obj = rules.data

			arr.push( object(_obj) )
			// 动态处理有step的对象
			// 升级开始值
			for (let key in stepObj) {
				switch (_obj.data[key].type) {
					case 'string':
						_obj.data[key].start = _obj.data[key].start+1
						break;

				}
			}

		} else {
			arr.push( object(rules.data) )
		}
	}

	return arr
}