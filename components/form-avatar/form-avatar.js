Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: String, value: '' },
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        remark: { type: String, value: '' }, // 对 label 字段的补充
        message: { type: String, value: '' }, // 必填后的错误提示内容
    },
    data: {
        formValue: '', // 头像地址
        errTips: ''
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
			this.setData({ formValue: newValue });
        }
    },
    methods: {
        onChooseAvatar(e) {
			const { avatarUrl } = e.detail;
            this.setData({ formValue: avatarUrl });
        },        
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = formValue ? '' : (message || '头像不能为空，请选择');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: formValue };
        },
        getFieldValue() {
            const { name, formValue } = this.data;
            return { name, value: formValue };
        },
        setFieldValue(newValue) {
            this.setData({ formValue: newValue });
        }
    }
})