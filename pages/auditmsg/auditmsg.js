import useRequest from '../../utils/request';
import { fetchAuditList } from '../../service/audit';
import { delay } from '../../utils/tools';

Page({
	data: {
		keyword: '',
		currentPage: 1,
		dataList: [],
		unAuditCount: 0, // 未审核总数
		// tabs
		activeStatus: 3, // 0: 待审核; 1: 已通过; 2: 已拒绝; 3 全部; 4: 已通过+已拒绝
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
	},
	// 列表请求
	async onAjaxList(thisPage, callback) {
		const { keyword, dataList, activeStatus, upStatus } = this.data;
		const result = await useRequest(() => fetchAuditList({ page: thisPage, status: activeStatus, keyword: keyword || '' }));
		if(result) {
			const newList = result['content'];

			// upStatus == 2 表示上拉加载，数据许合并
			this.setData({ currentPage: thisPage, dataList: upStatus == 2 ? [].concat(dataList, newList) : newList, unAuditCount: result['third_total'] });

			if(Object.prototype.toString.call(callback) == '[object Function]') {
				callback(newList);
			}
		}
	},
	// Tabs 切换
	onTabsChange(e) {
		const detailValue = e.detail.value;
		this.setData({ activeStatus: detailValue });
		this.onAjaxList(1);		
	},
	// 下拉刷新
	onRefresh() { // 1.audit 审核后会调用该方法; 2.refresh 下拉刷新
		this.setData({ downStatus: true });
		this.onAjaxList(1, async () => {
			await delay(500);
			this.setData({ downStatus: false });
		});
	},
	onPullUpLoaded(e) { // 上拉加载
		const { currentPage, upStatus } = this.data;
		if(upStatus == 2 || upStatus == 3) { // 加载中或已全部加载
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
	// 审核
	onAudit(e) {
		const { id, role, status } = e.currentTarget.dataset;
		wx.navigateTo({ 
			url: `/pages/audit/detail/detail?id=${id}&roleType=${role}&status=${status}`,
			events: { // 注册事件监听器
				acceptOpenedData: (formValues) => { // 监听由子页面触发的同名事件
					const { dataList } = this.data;
					const findIndex = dataList.findIndex((item) => item['id'] == formValues['id']);
					if(findIndex >= 0) {
						dataList.splice(findIndex, 1, formValues);
						this.setData({ dataList });
					}
				}
			}
		});
	},
	onLoad(options) {
		wx.showLoading();
		this.onAjaxList(1);
	},
	onReady() {

	}
});