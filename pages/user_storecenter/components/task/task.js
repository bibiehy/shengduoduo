import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchTaskList, fetchSureLanjian, fetchIsFenjian, fetchTaskJieSuo } from '../../../../service/user_storecenter';

// 获取 app 实例
const app = getApp();

Component({
	properties: {

	},
	data: {
		roleType: '', // 如果是分拣员不显示确认揽件
		keyword: '',
		tabsActive: -1, // 分类状态
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
		// 确认弹窗
		showConfirm: false,
		confirmBtn: { content: '确定', variant: 'base', loading: false },
        actionItem: {},
        // 卡板弹窗
        visibleKaban: false
	},
	methods: {
		// 
		async onAjaxList(thisPage, callback) { // 列表请求
			const { keyword, tabsActive, dataList, upStatus } = this.data;
			const result = await useRequest(() => fetchTaskList({ page: thisPage, keyword: keyword || '', status: tabsActive }));
			if(result) {
				const newList = result['content'];

				// upStatus == 2 表示上拉加载，数据许合并
				this.setData({ currentPage: thisPage, dataList: upStatus == 2 ? [].concat(dataList, newList) : newList });

				if(Object.prototype.toString.call(callback) == '[object Function]') {
					callback(newList);
				}
			}
		},	
		onRefresh() { // 下拉刷新
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
		// Tabs
		onTabsChange(e) {
			const tabsActive = e.detail.value;
			this.setData({ tabsActive, currentPage: 1 });
			wx.showLoading();
			this.onAjaxList(1);
		},
		// 搜索
		onSearchChange(e) { // 更新搜索关键字
			const targetValue = e.detail.value;
			this.setData({ keyword: targetValue });
		},
		onSearch() { // 搜索
			this.onAjaxList(1);
		},
		// 确认揽件
		onShowDialog(e) {
			const { item } = e.currentTarget.dataset;
			this.setData({ showConfirm: true, actionItem: item });
		},
		onCancelDialog() {
			this.setData({ showConfirm: false });
		},
		async onSureDialog() {
			const { dataList, actionItem } = this.data;
			const result = await useRequest(() => fetchSureLanjian({ id: actionItem['id'] }));
			if(result) {
				const findIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
				dataList[findIndex]['status'] = 10; // 改为已揽件
				this.setData({ showConfirm: false, dataList, actionItem: {} });
				wx.showToast({ title: '操作成功', duration: 1500, icon: 'success' });
			}
		},
		// 去分拣、继续分拣
		async onFenjian(e) {
			const { id } = e.currentTarget.dataset;
			const { dataList } = this.data;
			const result = await useRequest(() => fetchIsFenjian({ id }));
			if(result) {
				if(typeof result == 'object') { // 有人正在分拣
					const findIndex = dataList.findIndex((item) => item['id'] == id);
					dataList[findIndex]['lock_info'] = { ...result }; // 改为分拣中状态
					this.setData({ dataList });
				}else{ // 去分拣
					wx.navigateTo({
						url: `/pages/user_storecenter/pages/fenjian_detail/fenjian_detail?actionType=fenjian&id=${id}`,
						events: { // 注册事件监听器
							acceptOpenedData: (formValues) => { // 监听由子页面触发的同名事件
								const { dataList } = this.data;
								const findIndex = dataList.findIndex((listItem) => listItem['id'] == id);
								if(findIndex >= 0) {
									dataList.splice(findIndex, 1, formValues);
									this.setData({ dataList });
								}						
							}
						}
					});
				}
			}
		},
		onDetail(e) { // 点击item也跳转到分拣页
			const { item } = e.currentTarget.dataset;

			// 有人正在分拣中
			if(item['lock_info']) {
				return false;
			}

			if(item['status'] >= 10 && item['status'] < 20) { // 分拣、去分拣
				this.onFenjian({ currentTarget: { dataset: { id: item['id'] } } });
			}else{ // 确认揽件、调度中等，只能查看
				wx.navigateTo({ url: `/pages/user_storecenter/pages/fenjian_detail/fenjian_detail?actionType=view&id=${item['id']}` });
			}
        },
        // 修改卡板号
        onUpdateKaban() {
           this.setData({ visibleKaban: true });
        },
        onUpdateSure() {
            this.setData({ visibleKaban: false });
        }
	},
	lifetimes: {
		attached() { // 组件完全初始化完毕
			this.setData({ roleType: app['userInfo']['role_type'] });
			wx.showLoading();
			this.onAjaxList(1);

			useRequest(() => fetchTaskJieSuo({ id: 10, status: 2 }));
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})