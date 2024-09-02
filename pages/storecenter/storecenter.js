import useRequest from '../../utils/request';
import { fetchStoreCenterList, fetchStoreCenterDelete, fetchStoreCenterDisabled } from '../../service/storecenter';
import { delay } from '../../utils/tools';

Page({
	data: {
		keyword: '',
		currentPage: 1,
		dataList: [],
		// 确认删除弹窗
		showConfirm: false,
		confirmBtn: { content: '确定', variant: 'base' },
		deleteItem: {},
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
	},
	// 
	async onAjaxList(thisPage, callback) { // 列表请求
		const { keyword, dataList, upStatus } = this.data;
		const result = await useRequest(() => fetchStoreCenterList({ page: thisPage, name: keyword || '' }));
		if(result) {
			const newList = [];
			result['content'].forEach((item) => {
				item['address'] = JSON.parse(item['address']);
				item['addressStr'] = (item['address'].map((adItem) => adItem['label'])).join('、');
				newList.push(item);
			});

			// upStatus == 2 表示上拉加载，数据许合并
			this.setData({ currentPage: thisPage, dataList: upStatus == 2 ? [].concat(dataList, newList) : newList });

			if(Object.prototype.toString.call(callback) == '[object Function]') {
				callback(newList);
			}
		}
	},	
	onRefresh(action, formValues) { // 1.create/edit 添加/编辑页面，保存后会调用该方法; 2.refresh 下拉刷新
		const type = (typeof action) == 'string' ? action : action['type'];
		if(type == 'refresh') { // 下拉刷新
			this.setData({ downStatus: true });
			this.onAjaxList(1, async () => {
				await delay(500);
				this.setData({ downStatus: false });
			});
		}else if(type == 'create') { // 添加
			this.onAjaxList(1);
		}else if(type == 'edit') { // 编辑
			const { dataList } = this.data;
			const findIndex = dataList.findIndex((item) => item['id'] == formValues['id']);
			if(findIndex >= 0) {
				formValues['address'] = JSON.parse(formValues['address']);
				formValues['addressStr'] = (formValues['address'].map((adItem) => adItem['label'])).join('、');
				dataList.splice(findIndex, 1, formValues);
				this.setData({ dataList });
			}
		}
	},
	onPullUpLoaded(e) { // 上拉加载
		const { currentPage, upStatus } = this.data;
		if(upStatus == 3) { // 已全部加载
			return false;
		}

		const nextPage = currentPage + 1;
		this.setData({ upStatus: 2 });
		this.onAjaxList(nextPage, (currentList) => {
			this.setData({ upStatus: currentList.length <= 0 ? 3 : 1 });
		});
	},
	// 搜索
	onSearchChange(e) { // 更新搜索关键字
		const targetValue = e.detail.value;
		this.setData({ keyword: targetValue });
	},
	onSearch() { // 搜索
		this.onAjaxList(1);
	},
	// 操作
	async onDisabled(e) { // 禁用/启用
		const { dataList } = this.data;
		const { id, status, index } = e.currentTarget.dataset;
		const result = await useRequest(() => fetchStoreCenterDisabled({ id, type: status == 0 ? 1 : 0 }));
		if(result) {
			dataList[index]['status'] = status == 0 ? 1 : 0;
			this.setData({ dataList });
			wx.showToast({ title: status == 0 ? '已禁用' : '已启用', icon: 'success' });
		}
	},
	onCreate(e) { // 添加/编辑
		const { type, item } = e.currentTarget.dataset;
		const strItem = JSON.stringify(item || {});
		wx.navigateTo({ url: `/pages/storecenter/create/create?type=${type}&strItem=${strItem}` });
	},
	onDelete(e) {
		const { item } = e.currentTarget.dataset;
		this.setData({ showConfirm: true, deleteItem: item });
	},
	async onDeleteSure() { // 确认删除
		const { deleteItem, dataList } = this.data;
		this.setData({ showConfirm: false }); // 先关闭确认框

		const result = await useRequest(() => fetchStoreCenterDelete({ id: deleteItem['id'] }));
		if(result) {
			const findIndex = dataList.findIndex((item) => item['id'] == deleteItem['id']);
			dataList.splice(findIndex, 1);
			this.setData({ dataList, deleteItem: {} });
			wx.showToast({ title: '删除成功', icon: 'success' });
		}
	},
	onCancelDialog() {
		this.setData({ showConfirm: false });
	},
	onLoad(options) {
		this.onAjaxList(1);
	},
	onReady() {

	}
});