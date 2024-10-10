import useRequest from '../../utils/request';
import { fetchAllStoreCenter, fetchAllGuige, fetchRandomAvatar } from '../../service/global';
import { form, delay, createGuid } from '../../utils/tools';

Component({
	properties: {
		actionType: { type: String, value: 'signup' }, // 注册(signup/signupAgain)/审核(audit)/创建(create)/编辑(edit)
		// defaultValues: { type: Object, value: {} },
		phone: { type: String, value: '' }, // 只有 signup/signupAgain 时使用
		// 来自哪个页面，总共分3类，一个是注册，一个是审核列表，发货人个人中心，
		fromto: { type: String, value: '' }, // signup / audit / personal
	},
	data: {
		defaultValues: {},
		centerOptions: [],
		guigeOptions: []
	},
	methods: {
		getFormValues() {
			const formValues = form.validateFields(this);
			if(formValues) {
				formValues['address'] = JSON.stringify(formValues['address']);
			}
			
			return formValues;
		},
		getFormValuesUnverified() { // 审核拒绝时调用
			const formValues = form.getFieldsValue(this);
			formValues['address'] = JSON.stringify(formValues['address']);
			return formValues;
		},
		async getPageRequest(detailInfo={}) { // 下拉组件的请求，一般用于父组件详情接口请求完后调用或父组件 onLoad 方法中直接使用
			const { actionType } = this.data;

			// 获取随机头像和昵称
			let avatarNickname = {};
			if(['signup', 'create'].includes(actionType)) {
				const resultRandom = await useRequest(() => fetchRandomAvatar());
				if(resultRandom) {
					avatarNickname['avator'] = resultRandom['avatar'];
					avatarNickname['nickname'] = resultRandom['nick_name'];
				}
			}

			const centerList = await useRequest(() => fetchAllStoreCenter());
			const guigeList = await useRequest(() => fetchAllGuige());

			// 格式化集货中心
			const newCenterList = [];
			(centerList || []).forEach((item) => { // { label: '', value: '' }
				newCenterList.push({ label: item['name'], value: item['id'] });
			});

			// 格式化规格类别列表
			const newGuigeList = [];
			(guigeList || []).forEach((item) => { // { label: '', value: '' }
				newGuigeList.push({ label: item['name'], value: item['id'] });
			});

			this.setData({ defaultValues: { ...detailInfo, ...avatarNickname }, centerOptions: newCenterList, guigeOptions: newGuigeList });
		}
	},
	// 自定义组件内的生命周期
    lifetimes: {
		async attached() { // 组件完全初始化完毕
			
        },
        detached() { // 组件实例被从页面节点树移除时执行

        }
    }
})