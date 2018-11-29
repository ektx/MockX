
import base from './base.js'
import string from './string.js'
import number from './number.js'
import email from './email.js'
import color from './color.js'
import array from './array.js'
import boolean from './boolean.js'
import datetime from './dateTime.js'
import image from './image.js'
import phone from './phone.js';

function objFun (json) {

	let result = ''

	if (json.hasOwnProperty('type') && base.typeof(json.type) === 'string') {
		result = verificationType(json.type, json)
	} else {
		result = verificationType(base.typeof(json), json)
	}

	return result
}

export default objFun

function verificationType (type, json) {
	let result = null

	switch (type) {
		case 'array':
			result = array(json)
			break;

		case 'object':
			result = {}

			for (let key in json) {
				if (json.hasOwnProperty(key)) {
					let _inner = json[key]
					result[key] = objFun(_inner)
				}
			}
			break;

		case 'string':
			result = string(json.data ? json.data : json)
			break;

		case 'number':
			result = number(json)
			break;

		case 'boolean':
			result = boolean(json.data)
			break;

		case 'image':
			result = image(json.data)
			break;

		case 'datetime':
			result = datetime(json.data, json.time);
			break;

		case 'phone':
			result = phone(json.data)
			break;

		case 'email':
			result = email(json.data)
			break;
	}

	return result
}