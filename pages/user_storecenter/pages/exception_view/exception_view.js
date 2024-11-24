import useRequest from '../../../../utils/request';
import { delay, getCurrentDateTime } from '../../../../utils/tools';
import { fetchTaskReportView } from '../../../../service/user_storecenter';

Page({
	data: {
		fromto: '', // 1集货中心 2提货点
		taskInfo: {},
		laihuoInfo: {},
		qianshouList: [], // 分拣员上报的签收
		querenList: [], // 提货点确认
		message: '',
		// 图片
		visible: false,
		originFiles: [],
		showIndex: 0,
	},
	// 获取上报信息
	async getReportInfo(taskId, guigeId) {
		const result = await useRequest(() => fetchTaskReportView({ id: taskId, spec: guigeId }));
		if(result) {
			const { report_list, spec_info, ...rest } = result;
			const qianshouList = report_list.filter((item) => item['from'] == 1);
			const querenList = report_list.filter((item) => item['from'] == 2);
			this.setData({ taskInfo: rest, laihuoInfo: spec_info, qianshouList, querenList });
		}
	},
	// 查看大图
	onViewImage(e) {
		const { qianshouList, querenList } = this.data;
		const { type, id, index } = e.currentTarget.dataset;
		const newList = type == 'qianshou' ? qianshouList : querenList;
		const thisItem = newList.find((item) => item['id'] == id);
		this.setData({ visible: true, originFiles: thisItem['img'], showIndex: index });
	},
	onClose() {
		this.setData({ visible: false });
	},
	onLoad({ taskId, guigeId, fromto }) {
		this.setData({ fromto });
		this.getReportInfo(taskId, guigeId);
	},
	onUnload() { // 监听页面卸载，点击返回
		const { fromto } = this.data;
		if(fromto == 1) { // 集货中心
			const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
			eventChannel.emit('viewOpenedData'); // 触发父页面事件
		}
	}
})