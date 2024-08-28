import useRequest from '../../utils/request';
import { fetchGuigeList, fetchGuigeDelete, fetchGuigeDisabled } from '../../service/guige';

Page({
	data: {
		keyword: '',
		dataList: [],
		// 确认删除弹窗
		showConfirm: false,
		confirmBtn: { content: '确定', variant: 'base' },
		deleteItem: {}
	},	
	async onAjaxList(callback) { // 列表请求
		const { keyword } = this.data;
		const result = await useRequest(() => fetchGuigeList({ name: keyword || '' }));
		if(result) {
			this.setData({ dataList: result['content'] });
			if(Object.prototype.toString.call(callback) == '[object Function]') {
				callback();
			}
		}
	},
	onRefresh() { // 添加页面，保存后会调用该方法
		this.onAjaxList();
	},
	onSearchChange(e) {
		const targetValue = e.detail.value;
		this.setData({ keyword: targetValue });
	},
	onSearch() { // 搜索
		this.onAjaxList();
	},
	async onDisabled(e) { // 禁用/启用
		const { id, status } = e.currentTarget.dataset;
		const result = await useRequest(() => fetchGuigeDisabled({ id, type: status == 0 ? 1 : 0 }));
		if(result) {
			this.onAjaxList(() => {
				wx.showToast({ title: status == 0 ? '已禁用' : '已启用', icon: 'success' });
			});
		}
	},
	onCreate(e) { // 添加/编辑
		const { type, item } = e.currentTarget.dataset;
		const strItem = JSON.stringify(item || {});
		wx.navigateTo({ url: `/pages/guige/create/create?type=${type}&strItem=${strItem}` });
	},
	onDelete(e) {
		const { item } = e.currentTarget.dataset;
		this.setData({ showConfirm: true, deleteItem: item });
	},
	async onDeleteSure() { // 确认删除
		const { deleteItem } = this.data;
		this.setData({ showConfirm: false, deleteItem: {} }); // 先关闭确认框

		const result = await useRequest(() => fetchGuigeDelete({ id: deleteItem['id'] }));
		if(result) {
			this.onAjaxList(() => {
				wx.showToast({ title: '删除成功', icon: 'success' });
			});
		}
	},
	onCancelDialog() {
		this.setData({ showConfirm: false });
	},
	onLoad(options) {
		this.onAjaxList();
	},
	onReady() {

	},
	onPullDownRefresh() {

	},
	onReachBottom() {

	}
});