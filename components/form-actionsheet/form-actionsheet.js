Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: String, value: '', optionalTypes: [Number, Boolean] },
        description: { type: String, value: '' },
        placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        remark: { type: String, value: '' }, // 对 label 字段的补充
        message: { type: String, value: '' }, // 必填后的错误提示内容
        options: { type: Array, value: [] }, // { label: '', value: '' }
    },
    data: {
        formValue: '', // option.value
        formName: '', // option.label
        visible: false, // 显示/隐藏
        errTips: ''
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
            const { options } = this.data;
            const thisOption = options.find((item) => item['value'] == newValue) || { label: '', value: '' };
			this.setData({ formValue: thisOption['value'], formName: thisOption['label'] });
        }
    },
    methods: {
        onShowPopup() {
            const { disabled } = this.data;
            if(disabled) {
                return false;
            }

            this.setData({ visible: true });
        },
        onHidePopup() {
            this.setData({ visible: false });
        },
        onVisibleChange(e) {
            this.setData({ visible: e.detail.visible });
        },
        onRadioChange(e) {
            const { options } = this.data;
            const formValue = e.detail.value;
            const thisOption = options.find((item) => item['value'] == formValue);
            this.setData({ formValue: thisOption['value'], formName: thisOption['label'], errTips: '', visible: false });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, formName, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = formName ? '' : (message || '内容不能为空，请选择');
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
            const { options } = this.data;
            const thisOption = options.find((item) => item['value'] == newValue) || { label: '', value: '', content: '' };
            this.setData({ formValue: thisOption['value'], formName: thisOption['label'] });
        }
    }
})