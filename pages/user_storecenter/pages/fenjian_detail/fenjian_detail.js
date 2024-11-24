import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchTaskDetail, fetchTaskReport, fetchFenjianSave, fetchFenjianFinish, fetchKabanList, fetchTaskJieSuo } from '../../../../service/user_storecenter';

Page({
	data: {
		actionType: '', // fenjian/view
		detailInfo: {},
		isClickHide: false, // 是否点击了右上角的关闭
		kabanList: [], // 卡板数据 { card_no, status: 1：空闲，2：有货  3；已调度 }
		checkedList: [], // 选择的卡板号
		checkedListString: '',
        // 卡板弹窗
		visibleKaban: false,
		// 规格确认弹窗
		visibleConfirm: false,
        guigeItem: {},
        // 上报时发生跳转后，页面隐藏触发了解锁
        isSkipReport: false
	},
	// 获取任务详情
	async getTaskDetail(id) {
		const result = await useRequest(() => fetchTaskDetail({ id }));
		if(result) {
			// stepper_value 为步进器的值，stepper_checked 表示当前规格是否选中，选中后就不允许在操作
			result['task_spec_list'].forEach((item) => {
				item['stepper_value'] = item['center_receive_num'];
				item['stepper_checked'] = item['center_checked'];
			});

			// 设置卡板号默认值
			const checkedList = result['card_no'] || [];
			const checkedListString = checkedList.join(', ');

			this.setData({ detailInfo: result, checkedList, checkedListString });
			this.getKabanData(result['center_id'], result['pickup_id']);
		}
	},
	// 获取卡板数
	async getKabanData(centerId, pointId) {
		const result = await useRequest(() => fetchKabanList({ centerId, pointId }));
		if(result) {
			this.setData({ kabanList: result });
		}
    },
    // 设置卡板号
    onUpdateKaban() {
    	this.setData({ visibleKaban: true });
    },
    onUpdateSure(e) {
		const { numList } = e.detail;
		this.setData({ checkedList: numList, checkedListString: numList.join(', '), visibleKaban: false });
    },
	// 签收数
	onChangeStepper(e) {
		const { detailInfo } = this.data;
		const thisValue = e.detail.value;
		const thisItem = e.currentTarget.dataset.item;
		const thisIndex = detailInfo['task_spec_list'].findIndex((item) => item['id'] == thisItem['id']);
		detailInfo['task_spec_list'][thisIndex]['stepper_value'] = thisValue;
		detailInfo['task_spec_list'][thisIndex]['stepper_checked'] = false; // 防止先点勾选，在点击步数器
		this.setData({ detailInfo });
	},
	// 规格确认勾选
	onChecked(e) {
		const { detailInfo } = this.data;
		const thisChecked = e.detail.checked;
		const thisItem = e.currentTarget.dataset.item;
		if(thisChecked && thisItem['stepper_value'] > 0 && thisItem['num'] != thisItem['stepper_value']) {
			this.setData({ visibleConfirm: true, guigeItem: thisItem });
		}else{
			const thisIndex = detailInfo['task_spec_list'].findIndex((item) => item['id'] == thisItem['id']);
			detailInfo['task_spec_list'][thisIndex]['stepper_checked'] = thisChecked;

			if(thisItem['stepper_value'] == 0) { // 没有点击过进步器，直接点击勾选，需设置 stepper_value 等于来货数
				detailInfo['task_spec_list'][thisIndex]['stepper_value'] = thisItem['num'];
			}

			this.setData({ detailInfo });
		}
	},
	onCancelDialog() {
		this.setData({ visibleConfirm: false });
	},
	onSureDialog() { // 确认勾选
		const { detailInfo, guigeItem } = this.data;
		const thisIndex = detailInfo['task_spec_list'].findIndex((item) => item['id'] == guigeItem['id']);
		detailInfo['task_spec_list'][thisIndex]['stepper_checked'] = true;
		this.setData({ visibleConfirm: false, detailInfo });
	},
	// 异常上报
	onExceptionReport(e) {
        //
        this.setData({ isSkipReport: true });

        const { detailInfo } = this.data;
        const itemId = e.currentTarget.dataset.id;
		const strOriginList = JSON.stringify(detailInfo['task_spec_list']);
		wx.navigateTo({
			url: `/pages/user_storecenter/pages/exception_report/exception_report?itemId=${itemId}&strOriginList=${strOriginList}&fromto=1`,
			events: { // 注册事件监听器
				reportOpenedData: () => { // 监听由子页面触发的同名事件
					const thisIndex = detailInfo['task_spec_list'].findIndex((listItem) => listItem['id'] == itemId);
					detailInfo['task_spec_list'][thisIndex]['is_exception'] = 1;
                    this.setData({ detailInfo, isSkipReport: false });
				}
			}
		});
	},
	// 查看任务异常上报
	onViewReport(e) {
		//
		this.setData({ isSkipReport: true });
		
		const { id, spec } = e.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/user_storecenter/pages/exception_view/exception_view?taskId=${id}&guigeId=${spec}&fromto=1`,
			events: { // 注册事件监听器
				viewOpenedData: () => { // 监听由子页面触发的同名事件
                    this.setData({ isSkipReport: false });
				}
			}
		});
	},
	// 保存数据
	async onSave() {
		const { detailInfo, checkedList } = this.data;
		const guigeList = [];

		detailInfo['task_spec_list'].forEach((item) => {
			const thisItem = { task_spec_id: item['id'], spec: item['spec'], center_checked: item['stepper_checked'], before_num: item['center_receive_num'], after_num: item['stepper_value'] };
			guigeList.push(thisItem);
		});

		const params = { task_id: detailInfo['id'], card_no: checkedList, sorter_list: guigeList };
		const result = await useRequest(() => fetchFenjianSave(params));
		if(result) {
			wx.navigateBack({ delta: 1, success: () => {
				const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
				eventChannel.emit('acceptOpenedData', { id: detailInfo['id'], status: 11 }); // 已揽件任务有分拣记录			
			}});
		}
	},
	// 完成分拣
	async onFinish() {
		const { detailInfo, checkedList } = this.data;

		if(checkedList.length <= 0) {
			wx.showToast({ title: '请设置入库卡位', duration: 1500, icon: 'error' });
			return false;
		}

		if(!detailInfo['task_spec_list'].every((item) => item['stepper_checked'])) {
			wx.showToast({ title: '存在未确认规格', duration: 1500, icon: 'error' });
			return false;
		}

		const guigeList = [];
		detailInfo['task_spec_list'].forEach((item) => {
			const thisItem = { task_spec_id: item['id'], spec: item['spec'], center_checked: item['stepper_checked'], before_num: item['center_receive_num'], after_num: item['stepper_value'] };
			guigeList.push(thisItem);
		});

		const params = { task_id: detailInfo['id'], card_no: checkedList, sorter_list: guigeList };
		const result = await useRequest(() => fetchFenjianFinish(params));
		if(result) {
			wx.navigateBack({ delta: 1, success: () => {
				const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
				eventChannel.emit('acceptOpenedData', { id: detailInfo['id'], status: 20 }); // 已分拣				
			}});
		}
	},
	// 解锁任务，页面返回或者右上角关闭或者关闭后台
	onTaskJiesuo() {
		const { detailInfo } = this.data;
		useRequest(() => fetchTaskJieSuo({ id: detailInfo['id'], status: 2 }));
	},
	onLoad({ actionType, id }) {
		this.setData({ actionType });
		this.getTaskDetail(id);
	},
	onHide() { // 监听页面隐藏，页面点击了右上角的关闭，此时需跳转到首页并解锁任务
		const { isSkipReport } = this.data;
        if(isSkipReport == false) {
            this.setData({ isClickHide: true });
            this.onTaskJiesuo();
            wx.reLaunch({ url: '/pages/user_storecenter/index' });
        }		
	},
	onUnload() { // 监听页面卸载，点击返回或者上滑关闭或保存下面的按钮
		const { isClickHide } = this.data;
		if(!isClickHide) { // 如果是点击右上角关闭的话，就不用再执行解锁任务
			this.onTaskJiesuo();
		}
	},
})