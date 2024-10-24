import useRequest from '../../../../utils/request';
import { form, delay } from '../../../../utils/tools';
import { fetchRandomAvatar, fetchPickupFromCenter } from '../../../../service/global';
import { fetchShouCreate, fetchShouEdit, fetchShouDetail } from '../../../../service/user_fahuoren';

Page({
	data: {
        actionType: '', // create 添加; edit 编辑
        defaultValues: {},
        paytypeOptions: [{ label: '发货人', value: 1 }, { label: '收货人', value: 2 }],
        pointList: [], // 根据集货中心ID获取提货点
    },
    async getRandomAvatar() { // 获取随机昵称和头像
        const result = await useRequest(() => fetchRandomAvatar());
        if(result) {
            const defaultValues = { avator: result['avatar'], nickname: result['nick_name'] };
            this.setData({ defaultValues });
        }
    },
    async getPointsFromCenter() { // 根据集货中心ID获取提货点
        const app = getApp();
        const centerId = app['userInfo']['center_id'];
        const result = await useRequest(() => fetchPickupFromCenter({ id: centerId }));
        if(result) {
            const newList = [];
            result.forEach((item) => {
                newList.push({ label: item['point_name'], value: item['point_id'] });
            });

            this.setData({ pointList: newList });
        }
	},
	async onSubmit() {
		const { actionType, defaultValues } = this.data;
		const formValues = form.validateFields(this);
		if(formValues) {
			// address 为字符串
			formValues['address'] = JSON.stringify(formValues['address']);

			// 编辑
			if(actionType == 'edit') {
				formValues['id'] = defaultValues['id'];
			}

			const result = actionType == 'edit' ? (await useRequest(() => fetchShouEdit(formValues))) : (await useRequest(() => fetchShouCreate(formValues)));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				wx.navigateBack({ delta: 1, success: () => {
					const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
					eventChannel.emit('acceptOpenedData', actionType == 'edit' ? formValues : {});
				}});
			}
		}
	},
	onLoad(options) {
        const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
        this.setData({ actionType: type, defaultValues: jsonItem });

        // 根据集货中心ID获取提货点
        this.getPointsFromCenter();
		
		// 获取随机头像和昵称
        if(type == 'create') {
            this.getRandomAvatar();
        }
	}
})
