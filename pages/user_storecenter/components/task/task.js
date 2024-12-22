import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchPickupFromCenter } from '../../../../service/global';
import { fetchTaskList, fetchSureLanjian, fetchIsFenjian, fetchTaskJieSuo, fetchFenjianDetail, fetchKabanList, fetchKabanUpdate, fetchKabanDiaodu, fetchGuigeTotal, fetchUpdateFenjianNumber } from '../../../../service/user_storecenter';

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
		visibleKaban: false,
		kabanList: [],
		kabanItem: {},
		// 分拣明细
		fenjianList: [],
        visibleFenjian: false,
		// 卡板调度
		diaoduKeys: { label: 'point_name', value: 'point_id' },
        tihuodianList: [],
        visibleDiaodu: false,
        diaoduList: [],
		diaoduTihuoId: '',
		// 修改分拣员分拣数量
		visibleFenjianNumber: false,
		taskSpecId: '', // 按钮[修改]改为[取消，确定]
		fenjianNumberList: [],
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
								const findIndex = dataList.findIndex((listItem) => listItem['id'] == formValues['id']);
								if(findIndex >= 0) {
									dataList.splice(findIndex, 1, { ...dataList[findIndex], status: formValues['status'] });
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
        async onUpdateKaban(e) {
			const { item } = e.currentTarget.dataset;
			const result = await useRequest(() => fetchKabanList({ centerId: item['center_id'], pointId: item['pickup_id'] }));
			if(result) {
				this.setData({ kabanList: result, visibleKaban: true, kabanItem: item });
			}
        },
        async onUpdateSure(e) {
			const { kabanItem } = this.data;
			const { numList } = e.detail;
			const result = await useRequest(() => fetchKabanUpdate({ id: kabanItem['id'], card_list: numList }));
			if(result) {
				this.setData({ visibleKaban: false });
				wx.showToast({ title: '操作成功', duration: 1500, icon: 'success' });
			}
		},
		// 分拣明细
		async onFenjianDetail(e) {
			const { item } = e.currentTarget.dataset;
			const result = await useRequest(() => fetchFenjianDetail({ id: item['id'] }));
			if(result) {
				this.setData({ fenjianList: result, visibleFenjian: true });
			}
        },
        // 设置卡板调度
        async getTihuodianList() { // 获取集货中心下的提货点
            const centerId = app['userInfo']['center_id'];
			const result = await useRequest(() => fetchPickupFromCenter({ id: centerId }));
			if(result) {
				const newList = result.map((item) => ({ label: item['point_name'], value: item['point_id'] }));
				this.setData({ tihuodianList: newList });
			}
		},
		async getSelectTihuodian(e) { // 根据选择的提货点，获取其卡板号
            const centerId = app['userInfo']['center_id'];
            const pointId = e.detail.value;
            const result = await useRequest(() => fetchKabanList({ centerId, pointId }));
			if(result) {
				this.setData({ diaoduList: result, visibleDiaodu: true, diaoduTihuoId: pointId });
            }
        },
        // async onChangeDropdown(e) { // 根据选择的提货点，获取其卡板号
        //     const centerId = app['userInfo']['center_id'];
        //     const pointId = e.detail.value;
        //     const result = await useRequest(() => fetchKabanList({ centerId, pointId }));
		// 	if(result) {
		// 		this.setData({ diaoduList: result, visibleDiaodu: true, diaoduTihuoId: pointId });
        //     }
        // },
        async onDiaoduSure(e) {
			const { diaoduTihuoId } = this.data;
            const { numList } = e.detail;
            const centerId = app['userInfo']['center_id'];
			const result = await useRequest(() => fetchKabanDiaodu({ point_id: diaoduTihuoId, center_id: centerId, card_list: numList }));
			if(result) {
				this.setData({ visibleDiaodu: false });
				wx.showToast({ title: '操作成功', duration: 1500, icon: 'success' });
				await delay(1000);
				this.onAjaxList(1);
			}
		},
		// 修改分拣员分拣数量
		async onUpdateFenjianNumber (e) {
			const { item } = e.currentTarget.dataset;
			const result = await useRequest(() => fetchGuigeTotal({ id: item['id'] }));
			if(result) {
				this.setData({ fenjianNumberList: result, visibleFenjianNumber: true, kabanItem: item });
			}
		},
		onUpdateGuige(e) { // 修改
			const { id } = e.currentTarget.dataset;
			this.setData({ taskSpecId: id });
		},
		onChangeStepper(e) {
			const { fenjianNumberList, taskSpecId } = this.data;
			const thisValue = e.detail.value;
			const thisIndex = e.currentTarget.dataset.index;
			const parIndex = fenjianNumberList.findIndex((numItem) => numItem['task_spec_id'] == taskSpecId);
			fenjianNumberList[parIndex]['list'][thisIndex]['step_value'] = thisValue;
			this.setData({ fenjianNumberList });
		},
		onCancelGuige() { // 取消
			this.setData({ taskSpecId: '', kabanItem: {} });
		},
		async onSureGuige() { // 确定
			const { fenjianNumberList, taskSpecId, kabanItem } = this.data;
			const thisItem = fenjianNumberList.find((numItem) => numItem['task_spec_id'] == taskSpecId);
			const newValues = [];
			thisItem['list'].forEach((item) => {
				const afterNum = item['step_value'] === undefined ? item['num'] : item['step_value'];
				newValues.push({ before_num: item['num'], after_num: item['step_value'] || afterNum, spec: item['spec'], spec_name: item['spec_name'], create_user: item['create_user'] });
			});

			const params = { task_id: kabanItem['id'], task_spec_id: taskSpecId, sorter_list: newValues };
			const result = await useRequest(() => fetchUpdateFenjianNumber(params));
			if(result) {
				this.setData({ visibleFenjianNumber: false, taskSpecId: '', kabanItem: {} });
				wx.showToast({ title: '修改成功', icon: 'success' });
			}
		},
		// 标签打印
		onPrint() {
			
		}
	},
	lifetimes: {
		attached() { // 组件完全初始化完毕
			this.setData({ roleType: app['userInfo']['role_type'] });
			wx.showLoading();
            this.onAjaxList(1); // 全部
            this.getTihuodianList(); // 提货点

			// useRequest(() => fetchTaskJieSuo({ id: 14, status: 2 }));
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})