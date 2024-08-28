// components/form-picker/form-picker.js
Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: String, value: '' },
        title: { type: String, value: '' },
        placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        message: { type: String, value: '' }, // 必填后的错误提示内容
        remark: { type: String, value: '' }, // 对 label 字段的补充
        options: { type: Array, value: [] }, // { label: '', value: '' }
        cancelBtn: { type: String, value: '取消', optionalTypes: [Object, Boolean] },
        confirmBtn: { type: String, value: '确定', optionalTypes: [Object, Boolean] },
    },
    data: {
        formLabel: '', // option 中的 label，显示用的，option={ label: '', value: '' }
        formValue: [], // option 中的 value，值为 []
        visible: false, // picker 显示/隐藏
        errTips: '',
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value，需转为 []
            const { options } = this.data;
            const thisOption = options.find((option) => option['value'] == newValue) || { label: '', value: '' };
			this.setData({ formLabel: thisOption['label'], formValue: [thisOption['value']] });
        }
    },
    methods: {
        onShowPicker() {
            const { disabled } = this.data;
            if(disabled) {
                return false;
            }

            this.setData({ visible: true });
        },
        onHidePicker() {
            this.setData({ visible: false });
        },
        onSure(e) {
            const { label, value } = e.detail;
            this.setData({ formLabel: label[0], formValue: value, errTips: '' });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, options, message } = this.data;
            const thisValue = formValue[0] || '';
            const thisOption = options.find((option) => option['value'] == thisValue) || { label: '', value: '' };
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
            const thisValue = formValue[0] || '';
            const thisOption = options.find((option) => option['value'] == thisValue) || { label: '', value: '' };
            return { name, value: thisOption['value'] };
        },
        setFieldValue(value) {
            const { options } = this.data;
            const thisOption = options.find((option) => option['value'] == value) || { label: '', value: '' };
            this.setData({ formValue: [thisOption['value']] });
        }
    }
})