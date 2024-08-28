// components/form-select/form-select.js
// bind:callback 点击图标事件，参数为 e, e.detail.value = { name, value }

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: Number, value: '', optionalTypes: [String] },
        title: { type: String, value: '' },
        placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        message: { type: String, value: '' }, // 必填后的错误提示内容
        remark: { type: String, value: '' }, // 对 label 字段的补充
        options: { type: Array, value: [] }, // { label: '', value: '', disabled: false }
    },
    data: {
        formValue: '', // option.value 用于表单提交和组件显示
        formName: '', // option.label 用于显示
        formOptions: [], // 搜索后的 options
        visible: false, // 显示/隐藏
        errTips: '',
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
            const { options } = this.data;
            const thisOption = options.find((item) => item['value'] == newValue) || { label: '', value: '', content: '' };
            this.setData({ formValue: thisOption['value'], formName: thisOption['label'] });
        },
        options: function(newOptions) {
            this.setData({ formOptions: newOptions });
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
            const formValue = e.detail.value;
            this.setData({ formValue });
        },
        onSearch(e) {
            const { options } = this.data;
            const thisValue = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
            if(thisValue) {
                const newOptions = options.filter((item) => item['label'].includes(thisValue));
                this.setData({ formOptions: newOptions });
            }else{
                this.setData({ formOptions: options });
            }
        },
        onSure(e) {
            const { name, required, formValue, options } = this.data;
            if(required && !formValue) {
                wx.showToast({ icon: 'error', title: '值不能为空' });
                return false;
            }

            const thisOption = options.find((item) => item['value'] == formValue) || { label: '', value: '', content: '' };
			this.setData({ formValue: thisOption['value'], formName: thisOption['label'], errTips: '', visible: false });
			this.triggerEvent('callback', { name, value: formValue });
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
            const { formOptions } = this.data;
            const thisOption = formOptions.find((item) => item['value'] == newValue) || { label: '', value: '', content: '' };
            this.setData({ formValue: thisOption['value'], formName: thisOption['label'] });
        }
    }
})