
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

function obj (json) {
	let result = null

	switch (json.type) {
		case 'array':
			result = array(json)
			break;

		case 'object':
			result = {}

			for (let key in json.data) {
				result[key] = obj(json.data[key])
			}
			break;

		case 'string':
			result = string(json)
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

export default obj
