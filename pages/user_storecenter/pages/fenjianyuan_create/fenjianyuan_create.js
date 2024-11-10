import useRequest from '../../../../utils/request';
import { form, delay } from '../../../../utils/tools';
import { fetchRandomAvatar } from '../../../../service/global';
import { fetchFenCreate, fetchFenEdit, fetchFenDetail } from '../../../../service/user_storecenter';

Page({
	data: {
        actionType: '', // create 添加; edit 编辑
        defaultValues: {
			idcard_img: []
		},
    },
    async getRandomAvatar() { // 获取随机昵称和头像
        const result = await useRequest(() => fetchRandomAvatar());
        if(result) {
            const defaultValues = { avator: result['avatar'], nickname: result['nick_name'] };
            this.setData({ defaultValues });
        }
	},
	async getDetailInfo(id) {
		const result = await useRequest(() => fetchFenDetail({ id }));
        if(result) {
			result['idcard_front'] = result['idcard_img'][0] || '';
			result['idcard_back'] = result['idcard_img'][1] || '';
            this.setData({ defaultValues: result });
        }
	},
	async onSubmit() {
		const { actionType, defaultValues } = this.data;
		const formValues = form.validateFields(this);
		if(formValues) {
			// 编辑
			if(actionType == 'edit') {
				formValues['id'] = defaultValues['id'];
			}

			formValues['idcard_img'] = [formValues['idcard_front'], formValues['idcard_back']];
			delete formValues['idcard_front'];
			delete formValues['idcard_back'];

			const result = actionType == 'edit' ? (await useRequest(() => fetchFenEdit(formValues))) : (await useRequest(() => fetchFenCreate(formValues)));
			if(result) {
				wx.showToast({ title: '操作成功', icon: 'success' });
				await delay(500);
				wx.navigateBack({ delta: 1, success: () => {
					const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
					eventChannel.emit('acceptOpenedData', actionType == 'edit' ? result : {});
				}});
			}
		}
	},
	onLoad(options) {
        const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
        this.setData({ actionType: type });

		// 获取随机头像和昵称
        if(type == 'create') {
            this.getRandomAvatar();
        }else{ // edit
			this.getDetailInfo(jsonItem['id']);
		}
	}
})
