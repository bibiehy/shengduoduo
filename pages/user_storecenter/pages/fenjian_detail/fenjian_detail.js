import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchTaskDetail, fetchTaskReport, fetchFenjianSave, fetchFenjianFinish, fetchKabanList, fetchTaskJieSuo } from '../../../../service/user_storecenter';

Page({
	data: {
		actionType: '', // fenjian/view
		detailInfo: {},
		isClickHide: false, // 是否点击了右上角的关闭
        kabanList: [], // 卡板数据 { card_no, status: 1：空闲，2：有货  3；已调度 }
        // 卡板弹窗
        visibleKaban: false
	},
	// 获取任务详情
	async getTaskDetail(id) {
		const result = await useRequest(() => fetchTaskDetail({ id }));
		if(result) {
			this.setData({ detailInfo: result });
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
     onUpdateSure() {
         this.setData({ visibleKaban: false });
     },
	// 签收数
	onChangeStepper() {
		
	},
	// 保存数据
	onSave() {
		const { actionType } = this.data;
		wx.navigateBack({ delta: 1, success: () => {
			const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
			if(actionType == 'fenjian') { // 分拣
				eventChannel.emit('acceptOpenedCreate', {});
			}					
		}});
	},
	// 完成分拣
	onFinish() {

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
		this.setData({ isClickHide: true });
		this.onTaskJiesuo();
		wx.reLaunch({ url: '/pages/user_storecenter/index' });
	},
	onUnload() { // 监听页面卸载，点击返回或者上滑关闭或保存下面的按钮
		const { isClickHide } = this.data;
		if(!isClickHide) { // 如果是点击右上角关闭的话，就不用再执行解锁任务
			this.onTaskJiesuo();
		}
	},
})