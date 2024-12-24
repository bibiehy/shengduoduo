import useRequest from '../../../../utils/request';
import { fetchUserDetail, fetchEditDriver } from '../../../../service/user';
import { form, delay, createGuid } from '../../../../utils/tools';

// 获取 app 实例
const app = getApp();

Page({
	data: {
        
    },
    async onSubmit() { // 确认提交
		const childComponent = this.selectComponent('#templateDrivers');
		const formValues = childComponent.getFormValues(); // 需要验证
		if(formValues) {
			formValues['role_type'] = 3;
            formValues['id'] = app['userInfo']['id'];
	
			const result = await useRequest(() => fetchEditDriver({ ...formValues }));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(1000);
                wx.navigateBack({ delta: 1, success: () => {
                    const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
                    eventChannel.emit('acceptOpenedData', result);
                }}); 
			}
		}
	},
	async onLoad(options) {
        const userInfo = app['userInfo'];
        const result = await useRequest(() => fetchUserDetail({ id: userInfo['id'] }));
        if(result) {
            this.selectComponent('#templateDrivers').getPageRequest(result);
        }
	}
})