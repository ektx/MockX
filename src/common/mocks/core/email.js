
import string from './string.js'

export default function(str = 'mocks.com') {
	return string({
		max: 10,
		min: 3
	}).toLocaleLowerCase() +'@'+ str
}