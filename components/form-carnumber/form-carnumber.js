// 通过 const child = this.selectComponent('.my-component'); 获取实例后可直接调用组件的属性和方法
// child.data.formValue; 返回表单的值
// child.setData(); 给表单赋值
// child.getFieldVerify(); 获取校验后的表单值，{ verify: isVerify, name, value: formValue }
// child.getFieldValue(); 返回 formValue
// child.setFieldValue(value);

Component({
    behaviors: ['wx://form-field'],
    // 组件的对外属性
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
		value: { type: String, value: '' },
		placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },        
        type: { type: String, value: 'text' }, // 输入框类型
        remark: { type: String, value: '' }, // 对 label 字段的补充
        required: { type: Boolean, value: true }, // 是否必填
		message: { type: String, value: '' }, // 必填后的错误提示内容
		layout: { type: String, value: 'vertical' }, // 布局方式，可选项：vertical/horizontal
        placement: { type: String, value: 'left' }, // 文本内容位置，居左/居中/居右。可选项：left/center/right
    },
    // 组件的内部数据
    data: {
        formValue: '',
		errTips: '',
		platform: '', // devtools/mac/windows/android/ios
    },
    // 监听 properties 值变化
    observers: {
        value: function(newValue) { // 监听外部传递的 value
			this.setData({ formValue: newValue });
        }
    },
    // 组件的方法列表
    methods: {
		onChange(e) {
            const { required, regexp, message } = this.data;
            const formValue = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
            let errTips = '';

            if(required) {
                errTips = formValue ? '' : '内容不能为空，请输入';
                if(regexp && message) {
                    errTips = regexp.test(formValue) ? '' : message;
                }
            }

			this.setData({ formValue, errTips });
		},
		onBlur(e) { // 失去焦点
			const { name, formValue, required, type } = this.data;
			
			if(type === 'nickname') {
				return false;
			}

            if(required && !formValue) {
                this.setData({ errTips: '内容不能为空，请输入' });
                return false;
            }

            this.triggerEvent('onblur', { name, value: formValue });
        },
		onCarNumber() {
			const { disabled, platform } = this.data;
			if(disabled || platform == 'devtools') {
				return false;
			}

			const that = this;
			wx.chooseLicensePlate({ complete: (res) => {
				if(res['plateNumber']) {
					that.setData({ formValue: res['plateNumber'], errTips: '' });
				}
			}});
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, message } = this.data;
            let isVerify = true;
            
            if(required) {
                let errTips = formValue ? '' : (message || '车牌号不能为空，请添加');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: formValue };
        },
        getFieldValue() {
			const { name, formValue } = this.data;
            return { name, value: formValue };
        },
        setFieldValue(value) {
            this.setData({ formValue: value });
        }
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕			
			const deviceInfo = wx.getDeviceInfo();
			this.setData({ platform: deviceInfo['platform'] });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    },
})