
/*
	Number
*/

import base from './base.js'

export default function (rules) {
	let result = 0

	if (base.typeof(rules) === 'number') {
		result = rules
	} else {

		if ('length' in rules) {
			result = numLength(rules)
		} else {
			result = minAndMax (rules)
		}

	}

	return result
}

/*
	对大小值
	支持：
	@min @max @toFixed
*/
function minAndMax (rules) {
	let result = 0

	if ('min' in rules) {
		if (!('max' in rules)) {
			return '请输入 max 的值'
		} else {
			result = base.integer(rules.min, rules.max)				
		}
	} else {
		if ('max' in rules) {
			result = base.integer(rules.min, rules.max)	
		}
	}

	if ('toFixed' in rules) {
		result = parseFloat(result - Math.random()).toFixed( rules.toFixed )
	}

	return parseFloat(result)	
}


/*
	对长度的处理
	支持：
	@start @end @include @toFixed
*/
function numLength (rules) {
	let result = ''
	let length = rules.length
	let startL = rules.start ? rules.start.length : 0
	let endL   = rules.end   ? rules.end.length   : 0

	if ('include' in rules && rules.include) {
		length = length - startL - endL
	}

	if (length < 0) {
		return '长度要大于 0'
	}

	for (let i = 0; i < length; i++) {
		result += base.integer(0, 9)
	}

	if (result.startsWith(0)) {
		result = base.integer(1, 9) + result.substr(1)
	}

	if (startL) {
		result = rules.start + result
	}

	if (endL) {
		result += rules.end
	}

	if ('toFixed' in rules ) {
		if (length < rules.toFixed)
			return 'toFixed 要小于总长度'
		else {
			let str = result.toString()
			
			result = str.slice(0, 0 - (rules.toFixed + 1)) +'.'+ str.slice(0 - rules.toFixed)
		}

	}

	return parseFloat(result)
}