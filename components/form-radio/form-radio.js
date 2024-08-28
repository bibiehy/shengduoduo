// components/form-radio/form-radio.js
Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
		value: { type: String, value: '', optionalTypes: [Number, Boolean] },
        disabled: { type: Boolean, value: false },
        placement: { type: String, value: 'left' }, // 复选框和内容相对位置。可选项：left/right
        required: { type: Boolean, value: true }, // 是否必填
        message: { type: String, value: '' }, // 必填后的错误提示内容
        remark: { type: String, value: '' }, // 对 label 字段的补充
		options: { type: Array, value: [] }, // { label: '', value: '' }
		layout: { type: String, value: 'vertical' }, // 布局方式，可选项：vertical/horizontal
    },
    data: {
        formValue: '',
        errTips: ''
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
			this.setData({ formValue: newValue });
        }
    },
    methods: {
        onChange(e) {
            const formValue = e.detail.value;
			this.setData({ formValue });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, message, options } = this.data;
            const thisOption = options.find((option) => option['value'] == formValue) || { label: '', value: '' };
            let isVerify = true;
            
            if(required) { // thisOption['value'] 可能为 0，0为有效值
                const errTips = thisOption['label'] ? '' : (message || '内容不能为空，请选择');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: thisOption['value'], option: thisOption };
        },
        getFieldValue() {
            const { name, formValue, options } = this.data;
            const thisOption = options.find((option) => option['value'] == formValue) || { label: '', value: '' };
            return { name, value: thisOption['value'] };
        },
        setFieldValue(value) {
            this.setData({ formValue: value });
        }
    },
    // 自定义组件内的生命周期
    lifetimes: {
        attached() { // 组件完全初始化完毕
            const { value, options } = this.data;
            if(value === '') {
                const thisValue = options[0]['value'];
                this.setData({ formValue: thisValue });
            }
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    },
})