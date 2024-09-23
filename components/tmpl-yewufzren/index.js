import useRequest from '../../utils/request';
import { fetchRandomAvatar, fetchAllStoreCenter } from '../../service/global';
import { form, delay, createGuid } from '../../utils/tools';

// 猪小明
// 18069886088
// 润土
// 18069886011
// 中国农业银行
// 6242821234567890000

Component({
	properties: {
		actionType: { type: String, value: '' }, // 创建(create)/编辑(edit)
		roleType: { type: Number, value: '' }, // 8干线调度/9业务负责人/10财务管理/11差异审核员; 8和9需要设置分成比例
	},
	data: {
		defaultValues: {},
		centerOptions: [],
	},
	methods: {
		getFormValues() {
			return form.validateFields(this);
		},
		async getPageRequest(detailInfo={}) { // 下拉组件的请求，一般用于父组件详情接口请求完后调用或父组件 onLoad 方法中直接使用
			// 获取随机头像和昵称
			const { actionType } = this.data;
			let avatarNickname = {};
			if(actionType == 'create') {
				const resultRandom = await useRequest(() => fetchRandomAvatar());
				if(resultRandom) {
					avatarNickname['avator'] = resultRandom['avatar'];
					avatarNickname['nickname'] = resultRandom['nick_name'];
				}
			}

			// 格式化集货中心
			const newCenterList = [];
			const centerList = await useRequest(() => fetchAllStoreCenter());
			(centerList || []).forEach((item) => { // { label: '', value: '' }
				newCenterList.push({ label: item['name'], value: item['id'] });
			});

			this.setData({ defaultValues: { ...detailInfo, ...avatarNickname }, centerOptions: newCenterList });
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