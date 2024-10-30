import useRequest from '../../../../utils/request';
import { form, delay, fmtThousands, getCurrentDateTime } from '../../../../utils/tools';
import { fetchPickupFromCenter, fetchAllGuige, fetchGuigeByTypeId } from '../../../../service/global';
import { fetchTaskCreate, fetchTaskEdit, fetchTaskDetail, fetchTaskGuige, fetchAllShouhuoren } from '../../../../service/user_fahuoren';

// 
const app = getApp();
const userInfo = app['userInfo'];

Page({
	data: {
		// 发货人=center_id/center_name/goods_type
		// 收货人=receive_user_phone/pay_type/pickup_id
		// create 添加; edit 编辑，view 查看
		actionType: '', 
		taskId: '', // 编辑使用
		// form 表单
		name: '', // 任务名字
		center_id: '', // 集货中心ID
		center_name: '', // --集货中心名字
		estimate_time: '', // 预估送达集货中心的时间
		receive_user_id: '', // 收货人ID
		receive_username: '', // 收货人姓名
		receive_user_phone: '', // 收货人手机号
		pay_type: 1, // 运费支付方，默认发货人
		pickup_id: '', // 提货点ID
		goods_type: '', // 规格类型ID
		code: '', // 辅助标识，发货人标识 + 提货点标识 + 收货人标识
		// spec_list: [], // 规格列表 { spec, num }
		// total_number: '', // 总数量
		// total_freight_front: '', // 总运费
		// 运费支付方
		paytypeOptions: [{ label: '发货人', value: 1 }, { label: '收货人', value: 2 }],
		// 根据集货中心ID获取提货点
		pointItem: {}, // 选择的提货点信息，用于提交时的判断，和计算运费
		pointList: [], // { label, value, code }
		pointOriginList: [], // 设置的提货点信息和规格分类运费系数
		// 收货人
		shouhuorenCode: '', // 选择的收货人辅助标识code
		shouhuorenOrigin: [], // 格式化前的值
		shouhuorenList: [], // 格式化后的值，集货中心下收货人列表
		// 规格信息
		guigeTypeList: [], // 素有规格类别 { label, value }，格式化后的值，即所有类别, value是规格类型ID
		guigeList: [], // 根据规格类别ID获取的其规格数据，用于渲染 Table
		totalNumber: 0, // 规格件数 total_number
		totalMoney: '0.00', // 总计多少运费 total_freight_front
	},
	// 获取任务详情
	async getTaskDetail(taskId) {
		const result = await useRequest(() => fetchTaskDetail({ id: taskId }));
        if(result) {
			const resultGuige = (await useRequest(() => fetchGuigeByTypeId({ id: result['goods_type'] }))) || [];
			const defaults = {
				name: result['name'], // 任务名字
				center_id: result['center_id'], // 集货中心ID
				center_name: result['center_name'], // --集货中心名字
				estimate_time: result['estimate_time'], // 预估送达集货中心的时间
				receive_user_id: result['receive_user_id'], // 收货人ID
				receive_username: result['receive_username'], // 收货人姓名
				receive_user_phone: result['receive_user_phone'], // 收货人手机号
				pay_type: result['pay_type'] || 1, // 运费支付方，默认发货人
				pickup_id: result['pickup_id'], // 提货点ID
				goods_type: result['goods_type'], // 规格类型ID
				code: result['code'], // 辅助标识，发货人标识 + 提货点标识 + 收货人标识
				shouhuorenCode: result['code'].split('-').pop(), // 数组的最后一项
				totalNumber: result['total_number'],
				totalMoney: result['total_freight_front'] || '0.00',
			};

			// 根据提货点ID获取其提货点信息，用于运费计算
			const { pointOriginList } = this.data;
			const pointItem = pointOriginList.find((item) => item['point_id'] == result['pickup_id']);

			// 规格列表
			const guigeList = resultGuige.map((guigeItem) => {
				const thisItem = result['task_spec_list'].find((subItem) => subItem['spec'] == guigeItem['id']);
				return { ...guigeItem, number: thisItem['num'] };
			});

			this.setData({ pointItem, guigeList, ...defaults });
        }
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
		const { pointOriginList, shouhuorenCode } = this.data;
		const thisValue = e.detail.value; // 类别ID
		const pointItem = pointOriginList.find((item) => item['point_id'] == thisValue);
		const newCode = `${userInfo['code']}-${pointItem['code']}-${shouhuorenCode}`;
		this.setData({ pointItem, pickup_id: thisValue, code: newCode });

		// 提货点改变了 -> 对应的规格运费费率也变了，需要重新计算运费
		this.getTotalCost();
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
	onChangeGuigeType(e) { // 修改规格类型
		const thisValue = e.detail.value; // 类别ID
		this.getGuigeByTypeId(thisValue);
	},
	async getGuigeByTypeId(typeId) { // 根据规格类别ID获取其规格列表
		const result = await useRequest(() => fetchGuigeByTypeId({ id: typeId }));
		this.setData({ guigeList: result || [], goods_type: typeId, totalNumber: 0, totalMoney: '0.00' }); // 重置
	},	
	// 选择收货人后设置其相关默认信息
	onSelectShuohuoren(e) {
		const { shouhuorenOrigin, pointOriginList } = this.data;
		const detailValue = e.detail.value;
		const shouhuorenItem = shouhuorenOrigin.find((item) => item['id'] == detailValue);
		const pointItem = pointOriginList.find((item) => item['point_id'] == shouhuorenItem['point_id']);
		const newValues = {  // 设置默认信息
			receive_user_id: detailValue,
			receive_username: shouhuorenItem['username'], 
			receive_user_phone: shouhuorenItem['phone'], 
			pay_type: shouhuorenItem['pay_type'], // 运费支付方
			pickup_id: shouhuorenItem['point_id'], // 提货点			
			code: `${userInfo['code']}-${pointItem['code']}-${shouhuorenItem['code']}` // 发货人标识+提货点标识+收货人标识
		};

		this.setData({ shouhuorenCode: shouhuorenItem['code'], pointItem, ...newValues });

		// 改变收货人 -> 改变提货点 -> 规格运费费率变了，需从新计算价钱
		this.getTotalCost();
	},
	onChangeStepper(e) { // 件数
		const { guigeList } = this.data;
		const thisValue = e.detail.value;
		const thisId = e.target.dataset.id;
		const thisIndex = guigeList.findIndex((item) => item['id'] == thisId);
		guigeList[thisIndex]['number'] = thisValue;
		this.setData({ guigeList });

		// 每次加减件数都需要重新计算费率
		this.getTotalCost();
	},
	// 计算运费 = (基础运费 + 基础运费*规格类别运费系数 + 基础运费*发货人运费系数)*数量，保留两位小数; 
	// 1.改变收货人方法中调用 2.改变提货点方法中使用 3.件数增减方法中使用
	getTotalCost() {
		const { guigeList, goods_type, pointItem } = this.data;
		const thisRateItem = pointItem['spec_rate_list'].find((item) => item['spec'] == goods_type);
		if(thisRateItem) {
			let totalNumber = 0, totalMoney = 0;
			guigeList.forEach((item) => {
				totalNumber += (item['number'] || 0);
				totalMoney += item['freight']*(10000 + thisRateItem['freight_rate']*100 + userInfo['wages']*100)*(item['number'] || 0); // 百分比的数值，如10.58 没有%符号，放大了10000倍
			});

			totalMoney = fmtThousands((totalMoney/10000), 2); // 千分位
			this.setData({ totalNumber, totalMoney });
		}
	},
	// 数据提交
	async onSubmit() {
		const { actionType, taskId, pointItem, center_id, receive_username, receive_user_phone, totalNumber, totalMoney, guigeList } = this.data;
		const formValues = form.validateFields(this);
		if(formValues) {
			// 是否关闭收单
			if(pointItem['closed'] == 1) {
				wx.showToast({ title: '该提货点已关闭收单，请修改', duration: 2500, icon: 'none' });
				return false;
			}

			// 判断送达时间是否晚于最晚时间
			// const sendDateTime = formValues['estimate_time'];
			// const sendDateDay = getCurrentDateTime('YYYY-MM-DD', sendDateTime);
			// const sendLastTime = `${sendDateDay} ${pointItem['last_time']}`;
			// if((new Date(sendDateTime)) > (new Date(sendLastTime))) {
			// 	wx.showToast({ title: `最晚送达时间为【${sendLastTime}】，请修改`, duration: 2500, icon: 'none' });
			// 	return false;
			// }

			// 判断是否添加规格件数
			if(totalNumber <= 0) {
				wx.showToast({ title: '请添加规格件数', duration: 2500, icon: 'error' });
				return false;
			}

			if(actionType == 'edit') {
				formValues['id'] = taskId;
			}

			const spec_list = guigeList.map((item) => ({ spec: item['id'], num: item['number'] || 0 }));
			const newValues = { ...formValues, center_id, receive_username, receive_user_phone, spec_list, total_number: totalNumber, total_freight_front: totalMoney };
			const result = actionType == 'edit' ? (await useRequest(() => fetchTaskEdit(newValues))) : (await useRequest(() => fetchTaskCreate(newValues)));
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
	async onLoad(options) {
		const { type, strItem } = options;
		const jsonItem = strItem ? JSON.parse(strItem) : {};
		const { center_id, center_name } = userInfo;
        this.setData({ actionType: type, taskId: jsonItem['id'], center_id, center_name });

        // 根据集货中心ID获取提货点
		await this.getPointsFromCenter();

		// 获取发货人下所有收货人
		this.getShouhuorenList();

		// 获取所有规格类型
		this.getAllGuigeType();

		if(type == 'create') { // 添加
			this.getGuigeByTypeId(userInfo['type']); // 根据规格类别ID获取其规格列表
		}else{ // 编辑或查看 edit/view
			this.getTaskDetail(jsonItem['id']); // 获取任务详情
		}
	}
})