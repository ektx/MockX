
export default function (probability) {
	let result

	if (!isNaN(probability)) {
		result = Math.random() > 1 - probability
	} else {
		result = Boolean(Math.round(Math.random() * 2))
	}

	return result
}