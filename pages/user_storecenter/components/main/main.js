import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchMainList, fetchTaskDelete, fetchTaskPay, fetchTaskOrder, fetchTaskSend, fetchTaskCancel, fetchTaskException } from '../../../../service/user_fahuoren';
  

Component({
	properties: {
		
	},
	data: {
		dataList: [],
	},
	methods: {
		// 待揽件任务
        async getDailjTask() {
			wx.showLoading();
			await delay(500);
			const result = await useRequest(() => fetchMainList());
			wx.hideLoading();
			if(result) {
				this.setData({ dataList: result });
			}
		},
	},
	// 自定义组件内的生命周期
    lifetimes: {
		attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})