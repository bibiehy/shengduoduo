import useRequest from '../../../../utils/request';
import { fetchUserDetail, fetchAddDriver, fetchEditDriver } from '../../../../service/user';
import { form, delay, createGuid } from '../../../../utils/tools';


Page({
	data: {
        id: '',
        actionType: '',
    },
    async onSubmit() { // 确认提交
		const { actionType, id } = this.data;
		const childComponent = this.selectComponent('#templateDrivers');
        const fetchRequest = actionType == 'create' ? fetchAddDriver : fetchEditDriver;
		const formValues = childComponent.getFormValues(); // 需要验证
		if(formValues) {
			formValues['role_type'] = 3;

			if(actionType == 'edit') {
				formValues['id'] = id;
			}
	
			const result = await useRequest(() => fetchRequest({ ...formValues }));
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
        //
        const { actionType, id } = options;
        this.setData({ id, actionType });

        if(actionType == 'create') {
            this.selectComponent('#templateDrivers').getPageRequest({});
        }else{ // edit
            const result = await useRequest(() => fetchUserDetail({ id }));
            if(result) {
                this.selectComponent('#templateDrivers').getPageRequest(result);
            }
        }
	}
})