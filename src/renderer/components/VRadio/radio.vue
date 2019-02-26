
<template>
	<label :class="['v-radio-label', type]">
		<input 
			type="radio"
			class="v-radio-int" 
			:value="val" 
			v-model="inner"
			:disabled="isDisabled"
		>
		<div class="v-radio-slot">
			<slot></slot>
		</div>
	</label>
</template>

<script >
export default {
	name: 'v-radio',
	props: {
		// 动态值
		value: {
			type: [String, Number, Boolean],
			default: ''
		},
		// 固定值
		val: {
			type: [String, Number, Boolean],
			default: ''
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		isGroup () {
			if (this.$parent.$options.name === 'VRadioGroup') {
				this.group = this.$parent
				return true
			} else {
				return false
			}
		},

		inner: {
			get () {
				return this.isGroup ? this.group.value : this.value
			},
			set (val) {
				if (this.isGroup) {
					this.$parent.change(val)
				} else {
					this.$emit('input', val)
				}
				this.$emit('change', val)
			}
		},

		isDisabled () {
			return this.isGroup ? this.group.disabled : this.disabled
		},

		type () {
			return this.isGroup && this.group.type
		}
	}
}
</script>


<style lang="scss">
$activeColor: #09f;

label.v-radio-label {
	display: inline-flex;
	white-space: nowrap;
	align-items: center;

	div.v-radio-slot {
		display: inline-block;
		margin-left: 3px;
	}
	
	input.v-radio-int {
		-webkit-appearance: none;
		width: 14px;
		height: 14px;
		border: 1px solid $activeColor;
		border-radius: 100%;
		vertical-align: middle;
		position: relative;
		outline: none;
		cursor: pointer;
		box-sizing: border-box;
		
		&::after {
			content: '';
			display: block;
			width: 8px;
			height: 8px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate3D(-50%,-50%,0) scale(0);
			background-color: transparent;
			border-radius: 100%;
			transition: background-color .3s ease, transform .3s ease;
		}
		&:checked::after {
			background-color: $activeColor;
			transform: translate3D(-50%,-50%,0) scale(1);
		}

		&[disabled] {
			border-color: #bbb;
			cursor: default;

			&:checked::after {
				background-color: #bbb;
			}

			& + .v-radio-slot {
				filter: grayscale(100%) opacity(.5);
				pointer-events: none;
			}
		}
	}

	span {
		display: inline-block;
		vertical-align: middle;
	}

	// 按钮模式
	&[class$='button-mod'] {
		display: flex;
		flex: 1;

		input.v-radio-int {
			display: none;
		}

		.v-radio-slot {
			display: flex;
			flex: 1;
			flex-direction: column;
			height: 100%;
			padding: .3em;
			margin: 0;
			text-align: center;
			justify-content: center;
			border: 1px solid #bbb;
			border-left-width: 0;
			box-sizing: border-box;
			overflow: hidden;
		}

		&:nth-of-type(1) {
			.v-radio-slot {
				border-left-width: 1px;
				border-radius: 3px 0 0 3px;
			}
		}
		&:nth-last-of-type(1) {
			.v-radio-slot {
				border-radius: 0 3px 3px 0;
			}
		}

		.v-radio-int:checked + .v-radio-slot {
			color: #fff;
			background: $activeColor;
			border-color: $activeColor;
			box-shadow: -1px 0 0 0 $activeColor;
			transition: background-color .3s ease-in-out;
		}
	}

	&.vertical-button-mod {
		.v-radio-slot {
			padding: 5px 3px;
			text-align: left;
			border-top-width: 0;
			border-left-width: 1px;
		}

		&:nth-of-type(1) {
			.v-radio-slot {
				border-top-width: 1px;
				border-radius: 3px 3px 0 0;
			}
		}
		&:nth-last-of-type(1) {
			.v-radio-slot {
				border-radius: 0 0 3px 3px;
			}
		}

		.v-radio-int:checked + .v-radio-slot {
			box-shadow: 0 -1px 0 0 $activeColor;
		}
	}

}
	
</style>
