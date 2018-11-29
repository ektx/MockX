
import string from './string.js'

export default function(str = 'mocks.com') {
	return string('1-10').toLocaleLowerCase() +'@'+ str
}