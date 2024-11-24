import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime, createGuid, form } from '../../../../utils/tools';
import { fetchGuigeByTypeId } from '../../../../service/global';
import { fetchTaskReport } from '../../../../service/user_storecenter';

Page({
	data: {
		fromto: '', // 1集货中心 2提货点
		guigeInfo: {},
		originList: [], // 原列表
		guigeList: [], // 规格列表 { label: '', value: '' }
		qianshouIds: [{ id: 'ppmmnn' }], // 用于签收列表
		remark: '', // 签收信息提示
    },
	formatGuigeList(list) { // { label: '', value: '' }
		const { guigeInfo } = this.data;
		const newList = list.map((item) => ({ label: item['spec_name'], value: item['spec'] }));
		const thisIndex = newList.findIndex((item) => item['value'] == guigeInfo['spec']);
		const nextIndex = thisIndex + 1;
		const prevIndex = thisIndex - 1;
		let newRemark = '';
		if(newList[nextIndex]) {
			newRemark = `${guigeInfo['spec_name']}和${newList[nextIndex]['label']}`;
		}else if(newList[prevIndex]) {
			newRemark = `${newList[prevIndex]['label']}和${guigeInfo['spec_name']}`;
		}

		this.setData({ guigeList: newList, remark: newRemark });
	},
	addFormGuige() { // 添加类别
		const guid = createGuid(6);
		const { qianshouIds } = this.data;
		qianshouIds.push({ id: guid });
		this.setData({ qianshouIds });
	},
	async onSubmit() {
		const formValues = form.validateFields(this);
		if(formValues) {
			const { fromto, guigeInfo, originList, qianshouIds } = this.data;
			const laihuoInfo = { spec: guigeInfo['spec'], num: guigeInfo['num'], spec_name: guigeInfo['spec_name'], freight: guigeInfo['freight'], weight: guigeInfo['weight'] };
			const params = { task_id: guigeInfo['task_id'], img: formValues['img'], desc: formValues['desc'], type: fromto, from: laihuoInfo, confirm_list: [] };

			qianshouIds.forEach(({ id }) => {
				const guigeValue = formValues[`spec_name_${id}`];
				const guigeNumber = formValues[`num_${id}`];
				const thisItem = originList.find((subItem) => subItem['spec'] == guigeValue);
				params['confirm_list'].push({ spec: thisItem['spec'], num: guigeNumber, spec_name: thisItem['spec_name'], freight: thisItem['freight'], weight: thisItem['weight'] });
			});

			const result = await useRequest(() => fetchTaskReport(params));
			if(result) {
				//
				wx.showToast({ title: '操作成功', icon: 'success' });

				// 集货中心
				if(fromto == 1) {
					await delay(500);
					wx.navigateBack({ delta: 1, success: () => {
						const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
						eventChannel.emit('reportOpenedData'); // 触发父页面事件
					}});
				}
			}
		}
	},
	onLoad({ itemId, strOriginList, fromto }) {
		const originList = JSON.parse(strOriginList);
		const jsonGuige = originList.find((item) => item['id'] == itemId);
		this.setData({ guigeInfo: jsonGuige, originList, fromto: Number(fromto) });
		this.formatGuigeList(originList);
	}
})