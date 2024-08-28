// 对外绑定事件
// bind:onfocus 获得焦点
// bind:onblur 失去焦点

// 通过 const child = this.selectComponent('.my-component'); 获取实例后可直接调用组件的属性和方法
// child.data.formValue; 返回表单的值
// child.setData(); 给表单赋值
// child.getFieldVerify(); 获取校验后的表单值，{ verify: isVerify, name, value: formValue }
// child.getFieldValue(); 返回 formValue
// child.setFieldValue(value);

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
		value: { type: String, value: '' },
		placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },        
        required: { type: Boolean, value: true }, // 是否必填
        remark: { type: String, value: '' }, // 对 label 字段的补充
        message: { type: String, value: '' }, // 必填后的错误提示内容
        maxlength: { type: String, value: -1 }, // 用户最多可以输入的字符个数。默认为 -1，不限制输入长度，
        height: { type: String, value: 120 }, // 文本框的高度 24*4
    },
    data: {
        formValue: '',
        errTips: '',
        counter: 0, // 计数
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
			this.setData({ formValue: newValue });
        }
    },
    methods: {
        onChange(e) {
            const { required, message } = this.data;
            const formValue = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
            let errTips = '';

            if(required) {
                errTips = formValue ? '' : (message || '内容不能为空，请输入');
            }

            const counter = formValue.length;
			this.setData({ formValue, errTips, counter });
        },
        onFocus() { // 获得焦点
            const { name, formValue } = this.data;
            this.triggerEvent('onfocus', { name, value: formValue });
        },
        onBlur() { // 失去焦点
            const { name, formValue, required } = this.data;

            if(required && !formValue) {
                this.setData({ errTips: '内容不能为空，请输入' });
                return false;
            }

            this.triggerEvent('onblur', { name, value: formValue });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = formValue ? '' : (message || '内容不能为空，请输入');
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
    }
})