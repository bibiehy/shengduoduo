// 
import { getCurrentDateTime } from '../../utils/tools';

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: Array, value: [] }, // 数组
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
    },
    data: {
        formValue: '', // t-date-time-picker 的值
        startTime: '', // 开始时间
        endTime: '', // 结束时间
        showTime: [], // 确定时候显示的区间时间
        active: 'start', // 选择开始时间或结束时间 start/end
        visible: false, // 显示/隐藏
        errTips: '',
        currentTime: '', // 当前时间，只用于时间弹窗默认选中当前时间
    },
    observers: {
        value: function(newValue) { // []
            const { currentTime, active } = this.data;
            if(currentTime) {
                const startTime = newValue[0] || currentTime;
                const endTime = newValue[1] || currentTime;
                const formValue = active == 'start' ? startTime : endTime;
                const showTime = newValue.length > 0 ? [startTime, endTime] : [];
                this.setData({ formValue, startTime, endTime, showTime });
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
        onStartTime() { // 开始时间
            const { startTime } = this.data;
            this.setData({ active: 'start', formValue: startTime });
        },
        onEndTime() { // 结束时间
            const { endTime } = this.data;
            this.setData({ active: 'end', formValue: endTime });
        },
        onColumnChange(e) { // 每列滚动后的回调，设置当前值
            const { active } = this.data;
            const thisValue = e.detail.value;
            const keyName = active == 'start' ? 'startTime' : 'endTime';
            this.setData({ [keyName]: thisValue, formValue: thisValue });
        },
        onSure() {
            const { startTime, endTime } = this.data;
            this.setData({ showTime: [startTime, endTime], errTips: '' });
        },
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, showTime, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = showTime.length > 0 ? '' : (message || '日期不能为空，请选择');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: showTime };
        },
        getFieldValue() {
            const { name, showTime } = this.data;
            return { name, value: showTime };
        },
        setFieldValue(valueArray) {
            const { active } = this.data;
            const startTime = valueArray[0];
            const endTime = valueArray[1];
            const formValue = active == 'start' ? startTime : endTime;
            this.setData({ showTime: valueArray, formValue, startTime, endTime });
        }
    },
    // 自定义组件内的生命周期
    lifetimes: {
        attached() { // 组件完全初始化完毕
            const { format, value } = this.data;
            const currentTime = getCurrentDateTime(format);
            const startTime = value[0] || currentTime;
            const endTime = value[1] || currentTime;
            this.setData({ formValue: startTime, active: 'start', currentTime, startTime, endTime, showTime: value });
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    },
})