
import useRequest from '../../../../utils/request';
import { fetchUserDetail, fetchEditYewufzren } from '../../../../service/user';
import { form, delay, getRoleInfo } from '../../../../utils/tools';

Page({
	data: {
        defaultValues: {},
    },
    async onSubmit() {
        const { defaultValues } = this.data;
        const formValues = this.selectComponent('#templateYewufzren').getFormValues();
		formValues['id'] = defaultValues['id'];
		formValues['role_type'] = defaultValues['role_type'];

        const result = await useRequest(() => fetchEditYewufzren(formValues));
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
			this.selectComponent('#templateYewufzren').getPageRequest(result); // 调用子组件方法
        }
	}	
})