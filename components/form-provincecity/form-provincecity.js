// 
import provinceCityList from '../../utils/cityList';

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: Array, value: [], optionalTypes: [String] }, // selectedOptions[] { label: '', value: '' }
        title: { type: String, value: '' },
        placeholder: { type: String, value: '' },
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        message: { type: String, value: '' }, // 必填后的错误提示内容
        remark: { type: String, value: '' }, // 对 label 字段的补充
        options: { type: Array, value: provinceCityList },
        subTitles: { type: Array, value: ['请选择省份', '请选择城市', '请选择区/县'] }, // 二级提示内容
    },
    data: {
        formValue: [], // 选中的项，就是 selectedOptions，用于提交
        showNames: '', // 选中项的 label 用 / 隔开用于显示
        selectedId: '', // 区的ID，如 '120101'，用于自动选中省/市/区组件
        visible: false, // 显示/隐藏
        errTips: '',
    },
    observers: {
		value: function(newValue=[]) { // 监听外部传递的 value = selectedOptions
			const thisValue = Object.prototype.toString.call(newValue) == '[object String]' ? JSON.parse(newValue) : newValue;
            const labelArray = thisValue.map((item) => item['label']);
            const showNames = labelArray.join('/');
			const selectedId = thisValue.length > 0 ? thisValue[2]['value'] : '';
			this.setData({ formValue: thisValue, showNames, selectedId });
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
        onChange(e) {
            const { value, selectedOptions } = e.detail;
            const labelArray = selectedOptions.map((item) => item['label']);
            const showNames = labelArray.join('/');
			const selectedId = value;
            this.setData({ formValue: selectedOptions, showNames, selectedId, errTips: '' });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = formValue.length > 0 ? '' : (message || '地址不能为空，请选择');
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
            const labelArray = newValue.map((item) => item['label']);
            const showNames = labelArray.join('/');
            const selectedId = newValue.length > 0 ? newValue[2]['value'] : '';
			this.setData({ formValue: newValue, showNames, selectedId });
        }
    },
    // 自定义组件内的生命周期
    lifetimes: {
        attached() { // 组件完全初始化完毕
            
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    },
})