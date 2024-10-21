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
		// 运费支付方
		paytypeOptions: [{ label: '发货人', value: 1 }, { label: '收货人', value: 2 }],
		// 根据集货中心ID获取提货点
		pointList: [],
		// 收货人
		shouhuorenItem: '', // 选择的收货人信息，默认为空，值为{}
		shouhuorenOrigin: [], // 格式化前的值
		shouhuorenList: [], // 格式化后的值，集货中心下收货人列表
		// 规格信息
		goodsOrigin: [], // 格式化前的值
		goodsTypeList: [], // 格式化后的值，规格类别 { label, value }
		goodsGuigeList: [], // 规格列表，用于渲染和设置件数
	},
	// 根据集货中心ID获取提货点
	async getPointsFromCenter() {
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
	// 选择收货人
	onSelectShuohuoren(e) {
		const detailValue = e.detail.value;
		// { receive_user_id: '', receive_username: '', receive_user_phone: '', pay_type: '', pickup_id: '', code: '', goods_type: '' }
		// 再根据集货中心ID，提货点 pickup_id 获取类别信息
	},
	// 根据集货中心ID，提货点 pickup_id 获取类别信息
	async getGuigeInfo(centerId, pointId, defaultGuigeId) {
		const result = await useRequest(() => fetchTaskGuige({ centerId, pointId }));
		if(result) {
			// this.setData({ goodsOrigin, goodsTypeList, goodsGuigeList });
		}
	},
	// 创建任务规格运费=基础运费 + 基础运费*规格类别运费系数 + 基础运费*发货人运费系数，保留两位小数
	onLoad(options) {
		const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
        this.setData({ actionType: type, defaultValues: jsonItem });

        // 根据集货中心ID获取提货点
        this.getPointsFromCenter();
	}
})