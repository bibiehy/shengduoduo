import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchTaskList, fetchTaskDelete, fetchTaskPay, fetchTaskOrder, fetchTaskSend, fetchTaskCancel, fetchTaskException } from '../../../../service/user_fahuoren';

// 当前时间
const currentDatetime = getCurrentDateTime('YYYY-MM-DD HH:mm');

Component({
	properties: {

	},
	data: {
		keyword: '',
		tabsActive: -1, // 分类状态
		currentPage: 1,
		dataList: [],
		// 下拉刷新
		downStatus: false, // 组件状态，值为 true 表示下拉状态，值为 false 表示收起状态
		loadingProps: { size: '20px' }, // 设置 loading 大小
		// 上拉加载
		upStatus: 1, // 1.无状态；2.加载中；3.已全部加载
		// 弹窗
		showConfirm: '', // gopaying 发货人去支付; paysuccess 支付成功; gosetime 发货人已支付; sending 收货人确认配送; delete 删除任务; cancel 取消任务;
		confirmBtn: { content: '确定', variant: 'base', loading: false },
		confirmBtn2: { content: '去支付', variant: 'base' },
		actionItem: {},
        // 日期选择框
        defaultDatetime: currentDatetime,
        datetimeValue: '',
		datetimeVisible: false,
		// 取消任务原因
		textareaValue: '',
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
		// 按钮操作
		onCreate() { // 添加
			wx.navigateTo({
				url: `/pages/user_fahuoren/pages/task_create/task_create?type=create&strItem=`,
				events: { // 注册事件监听器
					acceptOpenedData: () => { // 监听由子页面触发的同名事件
						this.setData({ tabsActive: -1 }); // 显示全部
						this.onAjaxList(1);
					}
				}
			});
		},
		onEdit(e) { // 编辑
			const { item, type } = e.currentTarget.dataset;
			const strItem = JSON.stringify(item);
			wx.navigateTo({
				url: `/pages/user_fahuoren/pages/task_create/task_create?type=${type}&strItem=${strItem}`,
				events: { // 注册事件监听器
					acceptOpenedData: (formValues) => { // 监听由子页面触发的同名事件
						const { dataList } = this.data;
						const findIndex = dataList.findIndex((listItem) => listItem['id'] == item['id']);
						if(findIndex >= 0) {
							dataList.splice(findIndex, 1, formValues);
							this.setData({ dataList });
						}
					}
				}
			});
		},
		// gopaying 发货人去支付; paysuccess 支付成功; gosetime 发货人已支付; sending 收货人确认配送; delete 删除任务; cancel 取消任务; print 打印标签;
		onShowDialog(e) {
			const { action, item } = e.currentTarget.dataset;

			// 确认配送：是否关闭收单
			if(action == 'sending' && item['point_relation']['closed'] == 1) {
				wx.showToast({ title: '该提货点今日已关闭收单', duration: 2500, icon: 'none' });
				return false;
			}

			this.setData({ showConfirm: action, actionItem: item });
		},
		async onSureDialog() { // 弹窗确认
			const actionType = this.data.showConfirm;
			if(actionType == 'gopaying') { // 发货人去支付，支付完成弹出支付成功并设置发送时间
				this.onWxPay();
			}else if(actionType == 'paysuccess') { // 发货人已支付，支付提示+设置送达时间
                this.onPaySuccess();
			}else if(actionType == 'gosetime') { // 发货人已支付，支付成功关闭页面再次点击确认配送
				this.onPaySuccess();
			}else if(actionType == 'sending') { // 确认配送
				this.onTaskSendingShouhuoren();
			}else if(actionType == 'delete') { // 删除任务
				this.onTaskDelete();
			}else if(actionType == 'cancel') { // 取消任务
				this.onTaskCancel();
			}else if(actionType == 'print') { // 打印标签
				this.onPrintLabel();
			}		
		},
		async onWxPay() { // 去支付
			const { actionItem } = this.data;
			const result = await useRequest(() => fetchTaskOrder({ id: actionItem['id'] })); // 下单接口
			if(result['code'] == 0) {
				this.setData({ showConfirm: '' }); // 关闭弹窗
				wx.requestPayment({ ...result['data'], complete: (res) => {
					if(res['errMsg'] == 'requestPayment:ok') {
						this.setData({ showConfirm: 'paysuccess' });
					}else{ // requestPayment:fail (detail message) 其中 detail message 为后台返回的详细失败原因
						const message = res['errMsg'] == 'requestPayment:fail cancel' ? '您已取消支付' : '支付失败';
						const statusValue = res['errMsg'] == 'requestPayment:fail cancel' ? 3 : 2;
						wx.showToast({ title: message, duration: 2500, icon: 'error' });
						useRequest(() => fetchTaskPay({ id: actionItem['id'], status: statusValue, estimate_time: '', remark: res['errMsg'] }));
					}
				}});
			}else{
				wx.showToast({ title: '下单失败，请重新操作', duration: 2500, icon: 'none' });
			}		
		},
		async onPaySuccess() { // 支付提示+设置送达时间框的确定
            const { actionItem, datetimeValue, dataList } = this.data;
            const lastTime = actionItem['point_relation']['last_time'];
            
            if(!datetimeValue) {
                wx.showToast({ title: '请选择送达时间', duration: 2500, icon: 'error' });
				return false;
            }

			// 送货最晚时间判断
            const dateDay = getCurrentDateTime('YYYY-MM-DD', datetimeValue);
            const lastDatatime = `${dateDay} ${lastTime}`;
            if((new Date(datetimeValue)) > (new Date(lastDatatime))) {
                wx.showToast({ title: '已超过最晚送达时间，请修改', duration: 2500, icon: 'none' });
				return false;
            }

            // 调用支付 + 确认发送
            const result = await useRequest(() => fetchTaskPay({ id: actionItem['id'], status: 1, estimate_time: datetimeValue, remark: 'requestPayment:ok' }));
            if(result['code'] == 0) {
                const findIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
                dataList[findIndex]['is_pay'] = 1; // 已支付
                dataList[findIndex]['status'] = 2; // 待配送
				this.setData({ showConfirm: '', dataList, actionItem: {} });
				wx.showToast({ title: '操作成功', duration: 2500, icon: 'success' });
            }else{
				wx.showToast({ title: '设置失败请重试', duration: 2500, icon: 'error' });
			}
		},
		async onTaskSendingShouhuoren() { // 确认配送，收货人
			const { actionItem, datetimeValue, dataList } = this.data;
            const lastTime = actionItem['point_relation']['last_time'];
            
            if(!datetimeValue) {
                wx.showToast({ title: '请选择送达时间', duration: 2500, icon: 'error' });
				return false;
            }

			// 送货最晚时间判断
            const dateDay = getCurrentDateTime('YYYY-MM-DD', datetimeValue);
            const lastDatatime = `${dateDay} ${lastTime}`;
            if((new Date(datetimeValue)) > (new Date(lastDatatime))) {
                wx.showToast({ title: '已超过最晚送达时间，请修改', duration: 2500, icon: 'none' });
				return false;
			}

			const result = await useRequest(() => fetchTaskSend({ id: actionItem['id'], estimate_time: datetimeValue }));
			if(result) {
				const findIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
				dataList[findIndex]['status'] = 2; // 待配送
				this.setData({ showConfirm: '', dataList, actionItem: {} });
				wx.showToast({ title: '操作成功', duration: 2500, icon: 'success' });
			}
		},
		async onTaskDelete() { // 删除任务
			const { actionItem, dataList } = this.data;
			const result = await useRequest(() => fetchTaskDelete({ id: actionItem['id'] }));
			if(result) {
				const findIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
				dataList.splice(findIndex, 1);
				this.setData({ showConfirm: '', dataList, actionItem: {} });
				wx.showToast({ title: '删除成功', duration: 2500, icon: 'success' });
			}
		},
		async onTaskCancel() { // 取消任务
			const { actionItem, dataList, textareaValue } = this.data;

			if(!textareaValue) {
				wx.showToast({ title: '请输入取消原因', duration: 2500, icon: 'error' });
				return false;
			}

			const result = await useRequest(() => fetchTaskCancel({ id: actionItem['id'], reason: textareaValue }));
			if(result) {
				const findIndex = dataList.findIndex((item) => item['id'] == actionItem['id']);
				dataList[findIndex]['status'] = 99; // 已取消
				this.setData({ showConfirm: '', dataList, actionItem: {} });
				wx.showToast({ title: '任务已取消', duration: 2500, icon: 'success' });
			}
		},
		onChangeTextarea(e) {
			const detailValue = e.detail.value;
			this.setData({ textareaValue: detailValue });
		},
		onCancelDialog() {
			this.setData({ showConfirm: '' });
		},
		onPrintLabel() { // 打印标签

        },
        // 预估时间选择
        onShowDatePicker() { // 显示日期选择
			this.setData({ datetimeVisible: true });
        },
        onSureDatePicker(e) {
            const { value } = e.detail;
            this.setData({ datetimeValue: value, datetimeVisible: false });
        },
        onCancelDatePicker() {
            this.setData({ datetimeVisible: false });
        }
	},
	lifetimes: {
		attached() { // 组件完全初始化完毕
			wx.showLoading();
			this.onAjaxList(1);
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})