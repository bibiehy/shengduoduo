import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet/index';
import useRequest from '../../../../utils/request';
import { delay } from '../../../../utils/tools';
import { fetchDiaoduList, fetchDiaoduDelete, fetchDiaoduNotice } from '../../../../service/drivers';

// 获取 app 实例
const app = getApp();

Component({
	properties: {

	},
	data: {
		radioValue: 1, // 调度状态
		centerList: [],
		centerSelected: {},
		keyword: '',
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
		// 删除弹窗/消息通知
		deleteConfirm: false,
		messageConfirm: false,
		confirmBtn: { content: '确定', variant: 'base', loading: false },
		actionItem: {},
	},
	methods: {
		// 
		async onAjaxList(thisPage, callback) { // 列表请求
			const { radioValue, centerSelected, keyword, dataList, upStatus } = this.data;
			const result = await useRequest(() => fetchDiaoduList({ page: thisPage, status: radioValue, center_id: centerSelected['value'], keyword }));
			if(result) {
				// upStatus == 2 表示上拉加载，数据许合并
				const newList = result['content'];
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
		// 调度状态
		onRadioChange(e) {
			const { value } = e.detail;
			this.setData({ radioValue: value });
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
		// 选择集货中心
		onShowCenter() {
			const { centerList } = this.data;
			ActionSheet.show({
				theme: ActionSheetTheme.List,
				selector: '#jihuoCenterActionSheet',
				context: this,
				description: '请选择集货中心',
				items: centerList
			});
		},
		onCenterSelected(e) {
			const { selected } = e.detail;
			const { centerSelected } = this.data;

			if(selected['value'] == centerSelected['value']) {
				return false;
			}

			// 把集货中心信息存在本地
			// wx.setStorageSync('DIAODU_DRIVER_CENTER', JSON.stringify(selected));
			this.setData({ centerSelected: selected });
			this.onAjaxList(1);
		},
		// 修改
		onUpdate(e) {
			const { centerSelected } = this.data;
			const { item } = e.currentTarget.dataset;
			const strItem = JSON.stringify({ ...centerSelected, ...item });
			wx.navigateTo({
				url: `/pages/drivers/pages/mgt_add_diaodu/index?strItem=${strItem}`,
				events: { // 注册事件监听器
					acceptOpenedData: (data) => { // 编辑: 监听由子页面触发的同名事件
						const { dataList } = this.data;
						const findIndex = dataList.findIndex((listItem) => listItem['id'] == data['id']);
						if(findIndex >= 0) {
							dataList[findIndex]['card_list'] = data['card_list'];
							dataList[findIndex]['card_info']['use_num'] = data['card_list'].length;
							this.setData({ dataList });
						}
					}
				}
			});
		},
		// 弹窗
		onShowDialog(e) {
			const { item, type } = e.currentTarget.dataset;
			const confirmKey = type == 'delete' ? 'deleteConfirm' : 'messageConfirm';
			this.setData({ [confirmKey]: true, actionItem: item });
		},
		onCancelDialog() {
			this.setData({ deleteConfirm: false, messageConfirm: false, });
		},
		async onDeleteSure() {
			const { dataList, actionItem } = this.data;
			const result = await useRequest(() => fetchDiaoduDelete({ id: actionItem['id'] }));
			if(result) {
				const thisIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
				dataList.splice(thisIndex, 1);
				this.setData({ dataList, deleteConfirm: false, actionItem: {} });
				wx.showToast({ title: '删除成功', duration: 1500, icon: 'success' });
			}
		},
		async onMessageSure() {
			const { dataList, actionItem } = this.data;
			const result = await useRequest(() => fetchDiaoduNotice({ id: actionItem['id'] }));
			if(result) {
				const thisIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
				dataList[thisIndex]['status'] = 2; // 已通知
				this.setData({ dataList, deleteConfirm: false, actionItem: {} });
				wx.showToast({ title: '已通知配送', duration: 1500, icon: 'success' });
			}
		},
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕
			const userInfo = app['userInfo']; // 返回调度管理员所分配的集货中心信息
			const centerList = userInfo['center_list'].map((item) => ({ label: item['name'], value: item['id'] }));
			// const defaultCenter = JSON.parse(wx.getStorageSync('DIAODU_DRIVER_CENTER') || JSON.stringify(centerList[0]));?
			const defaultCenter = JSON.parse(wx.getStorageSync('DIAODU_MAIN_CENTER') || JSON.stringify(centerList[0]));
			
			this.setData({ centerList, centerSelected: defaultCenter });
			this.onAjaxList(1);
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})