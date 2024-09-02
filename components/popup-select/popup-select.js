// components/popup-select/popup-select.js
// 对外绑定事件
// bind:callback 回调函数，参数为 e, e.detail.value = { label, value }

Component({
    properties: {
		title: { type: String, value: '' }, // 暂时没用
        value: { type: Number, value: '', optionalTypes: [String] },
        placeholder: { type: String, value: '' },
        options: { type: Array, value: [] }, // { label: '', value: '', content: '' }
        showInput: { type: Boolean, value: false }, // 是否展示文本框形式，否则就用 solt
        width: { type: String, value: '100%' },
		display: { type: String, value: 'inline-block' },
    },
    data: {
        selectLabel: '',
        selectValue: '',
        visible: false, // 显示/隐藏
        searchOptions: [], // 搜索后的 options
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value
            const { options } = this.data;
            const thisOption = options.find((item) => item['value'] == newValue) || { label: '', value: '', content: '' };
            this.setData({ selectValue: thisOption['value'], selectLabel: thisOption['label'] });
        },
        options: function(newOptions) {
            this.setData({ searchOptions: newOptions });
        }
    },
    methods: {
        onShowPopup() {
            this.setData({ visible: true });
        },
        onHidePopup() {
            this.setData({ visible: false });
        },
        onVisibleChange(e) {
            this.setData({ visible: e.detail.visible });
        },
        onRadioChange(e) {
            const thisValue = e.detail.value;
            this.setData({ selectValue: thisValue });
        },
        onSearch(e) {
            const { options } = this.data;
            const thisValue = (e.detail.value).replace(/(^\s+)|(\s+$)/g, '');
            if(thisValue) {
                const newOptions = options.filter((item) => item['label'].includes(thisValue));
                this.setData({ searchOptions: newOptions });
            }else{
                this.setData({ searchOptions: options });
            }
        },
        onSure() {
            const { selectValue, options } = this.data;

            if(!selectValue) {
                wx.showToast({ icon: 'error', title: '请先选择' });
                return false;
            }

            const thisOption = options.find((item) => item['value'] == selectValue);
            this.setData({ selectValue: thisOption['value'], selectLabel: thisOption['label'], visible: false });
            this.triggerEvent('callback', { label: thisOption['label'], value: thisOption['value'] });
        }
    }
})