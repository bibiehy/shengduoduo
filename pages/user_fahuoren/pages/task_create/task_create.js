import useRequest from '../../../../utils/request';
import { form, delay } from '../../../../utils/tools';
import { fetchPickupFromCenter } from '../../../../service/global';
import { fetchTaskCreate, fetchTaskDetail, fetchTaskGuige } from '../../../../service/user_fahuoren';

// 
const app = getApp();
const userInfo = app['userInfo'];

Page({
	data: {
		// 发货人=center_id/center_name/goods_type
		// 收货人=receive_user_phone/pay_type/pickup_id
		actionType: '', // create 添加; edit 编辑
		defaultValues: {}, // 辅助标识code：发货人标识+提货点标识+收货人标识
		paytypeOptions: [{ label: '发货人', value: 1 }, { label: '收货人', value: 2 }], // 运费支付方
		pointList: [], // 根据集货中心ID获取提货点
		shouhuorenList: [], // 集货中心下收货人列表
		goodsTypeList: [], // 商品类别列表
		goodsGuigeList: [], // 商品规格列表
	},
	async getPointsFromCenter() { // 根据集货中心ID获取提货点
        const centerId = userInfo['center_id'] || 6;
        const result = await useRequest(() => fetchPickupFromCenter({ id: centerId }));
        if(result) {
            const newList = [];
            result.forEach((item) => {
                newList.push({ label: item['point_name'], value: item['point_id'] });
            });

			const defaultValues = { center_id: userInfo['center_id'], center_name: userInfo['center_name'] };
            this.setData({ pointList: newList, defaultValues  });
        }
	},
	onLoad(options) {
		const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
        this.setData({ actionType: type, defaultValues: jsonItem });

        // 根据集货中心ID获取提货点
        this.getPointsFromCenter();
	}
})