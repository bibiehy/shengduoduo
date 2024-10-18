import useRequest from '../../../../utils/request';
import { delay } from '../../../../utils/tools';
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
            const defaultValues = { avatar: result['avatar'], nickname: result['nick_name'] };
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
                newList.push({ label: item['name'], value: item['id'] });
            });

            this.setData({ pointList: newList });
        }
    },
	onLoad(options) {
        const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
        this.setData({ actionType: type, defaultValues: jsonItem });

        // 根据集货中心ID获取提货点
        this.getPointsFromCenter();
        
        if(type == 'create') {
            this.getRandomAvatar();
        }
	}
})