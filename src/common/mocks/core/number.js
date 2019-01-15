import base from './base.js'

export default function (opt) {
	if (opt.data) {
		return opt.data
	}

	let min = opt.min || 0
	let max = opt.max || min
	let num = base.integer(min, max)

	if (Reflect.has(opt, 'toFixed')) {
		return Number((Math.random()*num).toFixed(opt.toFixed))
	} 
	else if (Reflect.has(opt, 'length')) {
		num = ''
		for (let i = 0; i < opt.length; i++) {
			num += Math.floor(Math.random() * 10)
		}
	}

	return num
}
