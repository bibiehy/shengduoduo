// 对外绑定事件
// bind:suffixclick 点击图标事件，参数为 e, e.detail.value = { name, value }
// bind:onfocus 获得焦点
// bind:onblur 失去焦点

// 通过 const child = this.selectComponent('.my-component'); 获取实例后可直接调用组件的属性和方法
// child.data.formValue; 返回表单的值
// child.setData(); 给表单赋值
// child.getFieldVerify(); 获取校验后的表单值，{ verify: isVerify, name, value: formValue }
// child.getFieldValue(); 返回 formValue
// child.setFieldValue(value);

import { fmtThousands } from '../../utils/tools';

Component({
    // wx://form-field 使自定义组件有类似于表单控件的行为，并在 submit 事件中返回组件的字段名及其对应字段值
    // wx://form-field-group 使 form 组件可以识别到这个自定义组件内部的所有表单控件
    // wx://form-field-button 使 form 组件可以识别到这个自定义组件内部的 button，如果自定义组件内部有设置了 form-type 的 button ，它将被组件外的 form 接受
    // wx://component-export 若需要自定义返回内容，则需要定义 export 方法返回自定义{}，即父组件内 const child = this.selectComponent('.my-component'); child = {}
    // behaviors: ['wx://form-field', 'wx://component-export'],
    behaviors: ['wx://form-field'],
    // 组件的对外属性
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
		value: { type: String, value: '' },
		placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },        
        suffix: { type: String, value: '' }, // 元/个
        suffixicon: { type: String, value: '' }, // 图标
		type: { type: String, value: 'text' }, // 输入框类型。可选项：text/number/idcard/digit/safe-password/password/nickname 新增 phone/bankcard/tofixed/int
		max: { type: Number, value: '' }, // 最大值，只适用于'number', 'digit', tofixed, int
		min: { type: Number, value: '' }, // 最小值
        remark: { type: String, value: '' }, // 对 label 字段的补充
        required: { type: Boolean, value: true }, // 是否必填
        regexp: { type: String, value: '' }, // 正则表达式
		message: { type: String, value: '' }, // 必填后的错误提示内容
		layout: { type: String, value: 'vertical' }, // 布局方式，可选项：vertical/horizontal
		placement: { type: String, value: 'left' }, // 文本内容位置，居左/居中/居右。可选项：left/center/right
		decimal: { type: Number, value: 2 } // 默认保留2位小数
    },
    // 组件的内部数据
    data: {
        formValue: '',
		errTips: '',
		realType: '', // 就在 .wxml 用一下
    },
    // 监听 properties 值变化
    observers: {
		value: function(newValue) { // 监听外部传递的 value
			const { type, decimal } = this.data;

			if(newValue && type == 'tofixed') { // 输入时转为千分位，提交时转为浮点型
				newValue = fmtThousands(newValue, decimal);
			}

			this.setData({ formValue: newValue });
		},
		type: function(value) { // 文本框类型
			let newType = value;
			if(value == 'phone' || value == 'bankcard') {
				newType = 'number';
			}else if(value == 'tofixed') {
				newType = 'digit';
			}else if(value == 'int') {
				newType = 'number';
			}
			
			this.setData({ realType: newType });
		}
    },
    // 组件的方法列表
    methods: {
		onChange(e) {
            const { required, regexp, message, type, decimal } = this.data;
            let formValue = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
            let errTips = '';

            if(required) {
                errTips = formValue ? '' : '内容不能为空，请输入';
                if(formValue && regexp && message) {
					const reg = new RegExp(regexp, 'ig');
                    errTips = reg.test(formValue) ? '' : message;
                }
			}

			this.setData({ formValue, errTips });
        },
        onFocus() { // 获得焦点
			const { name, formValue, type } = this.data;
			
			// 千分位获得焦点去掉逗号
			if(formValue && type == 'tofixed') {
				const fmtValue = formValue.replaceAll(',', '');
				this.setData({ formValue: fmtValue });
			}

            this.triggerEvent('onfocus', { name, value: formValue });
        },
		onBlur(e) { // 失去焦点
			const { name, formValue, decimal, required, type, max, min, regexp, message } = this.data;
			
			if(type === 'nickname') {
				return false;
			}
			
			if(required) {
				let errTips = '';
				if(!formValue) {
					errTips = '内容不能为空，请输入';
				}else if(formValue && type == 'bankcard') { // 银行卡号
					errTips = /^\d{16,19}$/.test(formValue) ? '' : '格式不正确，请输入16~19位银行卡号';
				}else if(formValue && type == 'phone') { // 手机号码
					errTips = /^1\d{10}$/.test(formValue) ? '' : '手机号码格式不正确，请检查';
				}else if(formValue && type == 'idcard') {
					errTips = /(^\d{15}$)|(^\d{18}$)|(^\d{17}X$)/i.test(formValue) ? '' : '身份证号码格式不正确，请检查';
				}else if(formValue && ['number', 'digit', 'int'].includes(type) && max && min >= 0) {
					errTips = ((formValue >= min) && (formValue <= max)) ? '' : `请输入 ${min}~${max} 之内的数字`;
				}else if(formValue && type == 'tofixed' && max && min >= 0) {
					const replaceValue = formValue.replaceAll(',', '');
					errTips = ((replaceValue >= min) && (replaceValue <= max)) ? '' : `请输入 ${min}~${max} 之内的数字`;
				}else if(formValue && regexp && message) {
					const reg = new RegExp(regexp, 'ig');
					errTips = reg.test(formValue) ? '' : message;
				}

				this.setData({ errTips });
			}
			
			let newValue = '';
			if(formValue === '0' || formValue) {
				newValue = ['number', 'digit'].includes(type) ? parseFloat(formValue) : formValue;
            }
            
            // 为了兼容后台设定的必须是浮点型值类型，如果为空传 null
            if(typeof formValue == 'string' && formValue === '' && ['number', 'digit'].includes(type)) {
                newValue = null;
			}
			
			// 千分位并保留2位小数
			if(formValue && type == 'tofixed') {
				newValue = fmtThousands(formValue, decimal);
				this.setData({ formValue: newValue });
			}

            this.triggerEvent('onblur', { name, value: newValue });
        },
        onClick() { // 点击图标
            const { name, formValue } = this.data;
            this.triggerEvent('suffixclick', { name, value: formValue });
		},
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, type, formValue, max, min, regexp, message } = this.data;
            let isVerify = true;
            
            if(required) {
				let errTips = '';
				if(!formValue) {
					errTips = '内容不能为空，请输入';
				}else if(formValue && type == 'bankcard') { // 银行卡号
					errTips = /^\d{16,19}$/.test(formValue) ? '' : '格式不正确，请输入16~19位银行卡号';
				}else if(formValue && type == 'phone') { // 手机号码
					errTips = /^1\d{10}$/.test(formValue) ? '' : '手机号码格式不正确，请检查';
				}else if(formValue && type == 'idcard') {
					errTips = /(^\d{15}$)|(^\d{18}$)|(^\d{17}X$)/i.test(formValue) ? '' : '身份证号码格式不正确，请检查';
				}else if(formValue && ['number', 'digit', 'int'].includes(type) && max && min >= 0) {
					errTips = ((formValue >= min) && (formValue <= max)) ? '' : `请输入 ${min}~${max} 之内的数字`;
				}else if(formValue && type == 'tofixed' && max && min >= 0) {
					const replaceValue = formValue.replaceAll(',', '');
					errTips = ((replaceValue >= min) && (replaceValue <= max)) ? '' : `请输入 ${min}~${max} 之内的数字`;
				}else if(formValue && regexp && message) {
					const reg = new RegExp(regexp, 'ig');
                    errTips = reg.test(formValue) ? '' : message;
				}

                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

			let newValue = '';
			if(formValue === '0' || formValue) {
				newValue = ['number', 'digit'].includes(type) ? parseFloat(formValue) : formValue;
            }
            
            // 为了兼容后台设定的必须是浮点型值类型，如果为空传 null
            if(typeof formValue == 'string' && formValue === '' && ['number', 'digit'].includes(type)) {
                newValue = null;
			}
			
			// tofixed转为浮点型
			if(formValue && type == 'tofixed') {
				newValue = parseFloat(formValue.replaceAll(',', ''));
			}

            return { verify: isVerify, name, value: newValue };
        },
        getFieldValue() {
			const { name, type, formValue } = this.data;

			let newValue = '';
			if(formValue === '0' || formValue) {
				newValue = ['number', 'digit'].includes(type) ? parseFloat(formValue) : formValue;
            }
            
            // 为了兼容后台设定的必须是浮点型值类型，如果为空传 null
            if(typeof formValue == 'string' && formValue === '' && ['number', 'digit'].includes(type)) {
                newValue = null;
			}
			
			// tofixed转为浮点型
			if(formValue && type == 'tofixed') {
				newValue = parseFloat(formValue.replaceAll(',', ''));
			}

            return { name, value: newValue };
        },
        setFieldValue(value) {
			const { type, decimal } = this.data;
			if(value && type == 'tofixed') {
				value = fmtThousands(value, decimal);
			}


            this.setData({ formValue: value });
        }
    },
    // 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    },
    // 自定义组件设置 behaviors: ['wx://component-export'] 时，父组件使用 this.selectComponent('.my-component'); 时返回 return 的 {}
    // export() {
	// 	const that = this;
    //     return {
    //         getFieldValue() {
	// 			console.log('export', that.data);
	// 			return that.data.formValue;
	// 		},
	// 		setFieldValue(value) {
	// 			that.setData({ formValue: value });
	// 		}
    //     };
    // }
})