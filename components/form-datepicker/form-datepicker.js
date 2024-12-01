// 
import { getCurrentDateTime } from '../../utils/tools';

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
        mode: { type: String, value: '', optionalTypes: [Array] }, // year = 年；month = 年月；date = 年月日；hour = 年月日时；minute = 年月日时分; second = 年月日时分秒; 当类型为数组时，第一个值控制年月日，第二个值控制时分秒
        format: { type: String, value: 'YYYY-MM-DD HH:mm:ss' }, // 用于格式化 pick、change、confirm 事件返回的值
        start: { type: String, value: '' }, // 选择器的最小可选时间，默认为当前时间-10年
        end: { type: String, value: '' }, // 选择器的最大可选时间，默认为当前时间+10年
        showWeek: { type: Boolean, value: false }, // 是否在日期旁边显示周几（如周一，周二，周日等）
        steps: { type:Object, value: {} }, // 时间间隔步数，示例：{ minute: 5 }
        cancelBtn: { type: String, value: '取消', optionalTypes: [Object, Boolean] },
		confirmBtn: { type: String, value: '确定', optionalTypes: [Object, Boolean] },
		// 新增
		verify: { type: Boolean, value: true }, // false 时候为非表单形式
    },
    data: {
        formValue: '', // 用于设置组件选中和表单提交
        showTime: '',
        visible: false, // 显示/隐藏
        errTips: '',
        currentTime: '', // 当前时间，只用于时间弹窗默认选中当前时间
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
            const { currentTime } = this.data;
            if(currentTime) {
                const formValue = newValue || currentTime;
			    this.setData({ formValue, showTime: newValue });
            }
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
            const { value } = e.detail;
			this.setData({ formValue: value, showTime: value, errTips: '' });
			this.triggerEvent('callback', { value });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, formValue, showTime, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = showTime ? '' : (message || '日期不能为空，请选择');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: formValue };
        },
        getFieldValue() {
            const { showTime, name, formValue } = this.data;
            return { name, value: showTime ? formValue : '' };
        },
        setFieldValue(value) {
            const { currentTime } = this.data;
            this.setData({ formValue: value || currentTime, showTime: value });
        }
    },
    // 自定义组件内的生命周期
    lifetimes: {
        attached() { // 组件完全初始化完毕
            const { value, format } = this.data;
            const currentTime = getCurrentDateTime(format);
            const formValue = value || currentTime;
            this.setData({ formValue, currentTime, showTime: value });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    },
})