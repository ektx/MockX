
<template>
	<div :class="['v-rdaio-group', type]" :style="styles">
		<slot></slot>
	</div>
</template>

<script >
export default {
	name: 'VRadioGroup',
	props: {
		name: {
			type: String
		},
		value: {
			type: [String, Number, Boolean],
			default: ''
		},
		type: {
			type: String,
			default: '' // button-mod vertical-button-mod
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			styles: {
				gridTemplateColumns: `auto`,
				gridTemplateRows: 'auto',
				gridAutoFlow: 'columns'
			}
		}
	},
	mounted () {
		this.update()
	},
	watch: {
		value () {
			this.update() 
		},
		type (val) {
			if (this.$children) {
				this.$children.forEach(child => {
					if (child.$options.name === 'v-radio') {
						child.type = val
					}
				})
			}
		},
		disabled (val) {
			if (this.$children) {
				this.$children.forEach(child => {
					if (child.$options.name === 'v-radio') {
						child.iDisabled = child.disabled || val
					}
				})
			}
		}
	},
	methods: {
		change (data) {
			this.$emit('input', data)
			this.$emit('change', data)
		},

		update () {
			let groupName = Date.now()
			if (this.$children) {
				this.$children.forEach(child => {
					if (child.$options.name === 'v-radio') {
						child.innerName = groupName
						child.checkedStatus = child.val === this.value
						child.type = this.type
						child.iDisabled = this.disabled
					}
				})
			}

			this.getStyle()
		},

		getStyle () {
			if (this.type) {
				let BCR = this.$el.getBoundingClientRect()
				let size = this.$children.length

				if (this.type.startsWith('vertical-')) {
					this.styles.gridTemplateRows = `repeat(${size}, ${BCR.height/size}px)`
				} else {
					this.styles.gridTemplateColumns = `repeat(${size}, ${BCR.width/size}px)`
				}
			}
		}
	}
}
</script>

<style lang="scss">
.v-rdaio-group {
	&.vertical-button-mod,
	&.button-mod {
		display: grid;
	}
}
</style>
