// components/form-mulselect/form-mulselect.js
// bind:callback 点击图标事件，参数为 e, e.detail.value = { name, value }

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: Array, value: [] },
        title: { type: String, value: '' },
        placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        message: { type: String, value: '' }, // 必填后的错误提示内容
        options: { type: Array, value: [] }, // { label: '', value: '' }
        remark: { type: String, value: '' }, // 对 label 字段的补充
    },
    data: {
        formValues: [], // option.value
        formNames: '', // option.label
        formOptions: [],
        visible: false, // 显示/隐藏
        errTips: '',
    },
    observers: {
		value: function(newValue=[]) { // 监听外部传递的 value[]
			if(newValue.length <= 0) {
				return false;
			}

            const { options } = this.data;
            const formValues = [];
            const labelArray = [];
            newValue.forEach((value) => {
                const thisOption = options.find((item) => item['value'] == value);
                if(thisOption) {
                    formValues.push(thisOption['value']);
                    labelArray.push(thisOption['label']);
                }
            });
			
            this.setData({ formValues, formNames: labelArray.join(', ') });
        },
        options: function(newOptions) {
			if(newOptions.length <= 0) {
				return false;
			}

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
        onCheckboxChange(e) {
            const formValues = e.detail.value;
            this.setData({ formValues });
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
            const { name, required, formValues, options } = this.data;

            if(required && formValues.length <= 0) {
                wx.showToast({ icon: 'error', title: '值不能为空' });
                return false;
            }

            const newValues = [];
            const labelArray = [];
            formValues.forEach((value) => {
                const thisOption = options.find((item) => item['value'] == value);
                if(thisOption) {
                    newValues.push(thisOption['value']);
                    labelArray.push(thisOption['label']);
                }
            });
            
			this.setData({ formValues: newValues, formNames: labelArray.join(', '), errTips: '', visible: false });
			this.triggerEvent('callback', { name, value: newValues });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValues, formNames, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = formNames ? '' : (message || '内容不能为空，请选择');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: formValues };
        },
        getFieldValue() {
            const { name, formValues } = this.data;
            return { name, value: formValues };
        },
        setFieldValue(newValue) {
            const { formOptions } = this.data;
            const formValues = [];
            const labelArray = [];
            newValue.forEach((value) => {
                const thisOption = formOptions.find((item) => item['value'] == value);
                if(thisOption) {
                    formValues.push(thisOption['value']);
                    labelArray.push(thisOption['label']);
                }
            });

            this.setData({ formValues, formNames: labelArray.join(', ') });
        }
    }
})