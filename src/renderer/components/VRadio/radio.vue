
<template>
	<label :class="['v-radio-label', type]">
		<input 
			type="radio"
			class="v-radio-int" 
			:name="innerName" 
			:value="val"
			:checked="checkedStatus"
			:disabled="iDisabled"
			@change="change"
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
		value: {
			type: [String, Number, Boolean],
			default: ''
		},
		val: {
			type: [String, Number, Boolean],
			default: ''
		},
		name: {
			type: String
		},
		checked: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			checkedStatus: this.checked,
			// 默认使用用户输入的 name
			// 在有组的情况下,使用组的
			innerName: this.name,
			type: '',
			iDisabled: this.disabled
		}
	},
	mounted () {
		if (this.value && this.value === this.val) {
			this.checkedStatus = true
		}
	},
	methods: {
		change (evt) {
			this.checkedStatus = evt.target.checked
			
			if (this.$parent.$options.name === 'VRadioGroup') {
				this.$parent.change(this.val)
			} else {
				this.$emit('input', this.val)
				this.$emit('change', this.val)
			}
			
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
