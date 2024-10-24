import useRequest from '../../../../utils/request';
import { form, delay } from '../../../../utils/tools';
import { fetchPickupFromCenter, fetchAllGuige, fetchGuigeByTypeId } from '../../../../service/global';
import { fetchTaskCreate, fetchTaskDetail, fetchTaskGuige, fetchAllShouhuoren } from '../../../../service/user_fahuoren';

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
		pointItem: {}, // 选择的提货点信息，用于提交时的判断，和计算运费
		pointList: [], // { label, value, code }
		pointOriginList: [], // 设置的提货点信息和规格分类运费系数
		// 收货人
		shouhuorenItem: '', // 选择的收货人信息
		shouhuorenOrigin: [], // 格式化前的值
		shouhuorenList: [], // 格式化后的值，集货中心下收货人列表
		// 规格信息
		guigeTypeList: [], // 素有规格类别 { label, value }，格式化后的值，即所有类别, value是规格类型ID
		guigeList: [], // 根据规格类别ID获取的其规格数据，用于渲染 Table
		totalNumber: 0, // 规格件数 total_number
		totalMoney: '0.00', // 总计多少运费 total_freight
	},
	// 提货点
	async getPointsFromCenter() { // 根据集货中心ID获取提货点
        const centerId = userInfo['center_id'];
        const result = await useRequest(() => fetchPickupFromCenter({ id: centerId }));
        if(result) {
            const newList = [];
            result.forEach((item) => newList.push({ label: item['point_name'], value: item['point_id'] }));
            this.setData({ pointList: newList, pointOriginList: result  });
        }
	},
	async onChangePoint(e) { // 选择提货点后，更新辅助标识：发货人标识+提货点标识+收货人标识
		const { defaultValues, pointOriginList, shouhuorenItem } = this.data;
		const thisValue = e.detail.value; // 类别ID
		const pointItem = pointOriginList.find((item) => item['point_id'] == thisValue);
		const newCode = `${userInfo['code']}-${pointItem['code']}-${shouhuorenItem['code']}`;
		this.setData({ pointItem, defaultValues: { ...defaultValues, code: newCode } });
	},
	// 收货人
	async getShouhuorenList() { // 获取发货人下所有收货人
		const result = await useRequest(() => fetchAllShouhuoren({ id: userInfo['id'] }));
		if(result) {
			const newList = result.map((item) => ({ label: `${item['username']} ${item['phone']}`, value: item['id'] }));
			this.setData({ shouhuorenOrigin: result, shouhuorenList: newList });
		}
	},
	// 规格
	async getAllGuigeType() { // 获取所有规格类型
		const result = await useRequest(() => fetchAllGuige());
		if(result) {
			const newList = result.map((item) => ({ label: item['name'], value: item['id'] }));
			this.setData({ guigeTypeList: newList, });
		}
	},
	async getGuigeByTypeId(typeId) { // 根据规格类别ID获取其规格列表
		const result = await useRequest(() => fetchGuigeByTypeId({ id: typeId }));
		if(result) {
			this.setData({ guigeList: result, totalNumber: 0, totalMoney: '0.00' }); // 重置
		}
	},
	onChangeGuigeType(e) { // 修改规格类型
		const thisValue = e.detail.value; // 类别ID
		this.getGuigeByTypeId(thisValue);
	},
	// 选择收货人后设置其相关默认信息
	onSelectShuohuoren(e) {
		const { shouhuorenOrigin, pointOriginList, defaultValues } = this.data;
		const detailValue = e.detail.value;
		const shouhuorenItem = shouhuorenOrigin.find((item) => item['id'] == detailValue);
		const pointItem = pointOriginList.find((item) => item['point_id'] == shouhuorenItem['point_id']);
		const newValues = {  // 设置默认信息
			...defaultValues, 
			receive_username: shouhuorenItem['username'], 
			receive_user_phone: shouhuorenItem['phone'], 
			pay_type: shouhuorenItem['pay_type'], // 运费支付方
			pickup_id: shouhuorenItem['point_id'], // 提货点			
			code: `${userInfo['code']}-${pointItem['code']}-${shouhuorenItem['code']}` // 发货人标识+提货点标识+收货人标识
		};

		this.setData({ shouhuorenItem, pointItem, defaultValues: newValues });		
	},
	onChangeStepper(e) { // 件数
		const { guigeList, pointItem } = this.data;
		const thisValue = e.detail.value;
		const thisId = e.target.dataset.id;
		const thisIndex = guigeList.findIndex((item) => item['id'] == thisId);
		guigeList[thisIndex]['number'] = thisValue;
		this.setData({ guigeList });

		console.log(pointItem);
		console.log(guigeList);
	},
	// 创建任务规格运费=基础运费 + 基础运费*规格类别运费系数 + 基础运费*发货人运费系数，保留两位小数
	onLoad(options) {
		const { type, strItem } = options;
		const jsonItem = JSON.parse(strItem);
		const defaultValues = { ...jsonItem, center_id: userInfo['center_id'], center_name: userInfo['center_name'], goods_type: userInfo['type'] };
        this.setData({ actionType: type, defaultValues });

        // 根据集货中心ID获取提货点
		this.getPointsFromCenter();

		// 获取发货人下所有收货人
		this.getShouhuorenList();

		// 获取所有规格类型
		this.getAllGuigeType();

		// 根据规格类别ID获取其规格列表
		this.getGuigeByTypeId(userInfo['type']);
	}
})