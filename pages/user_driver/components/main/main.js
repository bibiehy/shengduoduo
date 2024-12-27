import useRequest from '../../../../utils/request';
import { delay, form } from '../../../../utils/tools';
import { fetchCurrentTask, fetchAcceptTask, fetchRefuseTask, fetchFache, fetchTaskComplete } from '../../../../service/user_driver';

// 获取 app 实例
const app = getApp();

Component({
	data: {
		userInfo: {},
        // dataList: [],
        detailInfo: {},
		weekSummary: { total_num: 0, total_profit: 0 }, // 本周收益
		monthSummary: { total_num: 0, total_profit: 0 }, // 本月收益
        // 确认弹窗
        textareaValue: '',
        actionType: '', // refused/completed
        confirmBtn: { content: '确定', variant: 'base', loading: false },
		// actionItem: {},
	},
	methods: {
		// 面板收益统计
		async getProfitPanel() {
			const result = await useRequest(() => fetchProfitPanel());
			if(result) {
				this.setData({ todaySummary: result['today_summary'], weekSummary: result['week_summary'], monthSummary: result['month_summary'] });
			}
		},
		// 获取当前任务
        async getDailjTask(params) {
			wx.showLoading();
			await delay(500);
			const result = await useRequest(() => fetchMainList(params));
			wx.hideLoading();
			if(result) {
				this.setData({ dataList: result['content'] });
			}
        },
        // 弹窗：拒绝、确认送达
        onChangeTextarea(e) {
			const detailValue = e.detail.value;
			this.setData({ textareaValue: detailValue });
		},
		onShowDialog(e) {
			const { type } = e.currentTarget.dataset;
			this.setData({ actionType: type });
		},
		onCancelDialog() {
			this.setData({ actionType: '' });
		},
		async onSureDialog() { // 拒绝、确认送达
			const { actionItem, textareaValue } = this.data;
			const result = await useRequest(() => fetchSureLanjian({ id: actionItem['id'] }));
			if(result) {
				this.setData({ actionType: '' });
				wx.showToast({ title: '操作成功', duration: 1500, icon: 'success' });
				this.getDailjTask();
			}
		},
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached(options) { // 组件完全初始化完毕
			this.setData({ userInfo: app['userInfo'] });
			// this.getProfitPanel();
			// this.getDailjTask();
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})