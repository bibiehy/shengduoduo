
import useRequest from '../../../../utils/request';
import { fetchUserDetail, fetchEditFahuoren } from '../../../../service/user';
import { form, delay } from '../../../../utils/tools';

Page({
	data: {
        defaultValues: {},
    },
    async onSubmit() {
		const { defaultValues } = this.data;
		const childComponent = this.selectComponent('#templateFahuoren');
        const formValues = childComponent.getFormValues(); // 会验证;
		formValues['id'] = defaultValues['id'];
		formValues['role_type'] = 1;

        const result = await useRequest(() => fetchEditFahuoren(formValues));
        if(result) {
            wx.showToast({ title: '操作成功', icon: 'success' });
            await delay(1000);

            wx.navigateBack({ delta: 1, success: () => {
                const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
                eventChannel.emit('acceptOpenedData', { ...defaultValues, ...formValues });
            }});            
        }
    },
    async onLoad(options) {
        const app = getApp(); // 获取 app 实例
        const userInfo = app['userInfo'];
        const result = await useRequest(() => fetchUserDetail({ id: userInfo['id'] }));
        if(result) {
			this.setData({ defaultValues: result });
			this.selectComponent('#templateFahuoren').getPageRequest(result);
        }
	}	
})