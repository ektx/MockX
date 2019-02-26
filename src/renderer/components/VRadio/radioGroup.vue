
<template>
	<div :class="['v-rdaio-group', type]" :style="styles">
		<slot></slot>
	</div>
</template>

<script >
export default {
	name: 'VRadioGroup',
	props: {
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
				gridTemplateRows: 'auto'
			}
		}
	},
	watch: {
		type (val) {
			this.getStyle()
		}
	},
	methods: {
		change (data) {
			this.$emit('input', data)
			this.$emit('change', data)
		},

		getStyle () {
			if (this.type) {
				let BCR = this.$el.getBoundingClientRect()
				let size = this.$children.length

				if (this.type.startsWith('vertical-')) {
					this.styles.gridTemplateRows = `repeat(${size}, ${BCR.height/size}px)`
					this.styles.gridTemplateColumns = 'auto'
				} else {
					this.styles.gridTemplateRows = 'auto'
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
