import useRequest from '../../../utils/request';
import { fetchAuditDetail, fetchAuditResult } from '../../../service/auditask';
import { form, delay, createGuid, getRoleInfo } from '../../../utils/tools';

// 获取角色类型
const { roleAllObject } = getRoleInfo();

Page({
	data: {
		title: '',
		defaultValues: {}, // 查看时候使用
		roleAllObject: roleAllObject,
        // 弹窗
        actionStatus: '', // 1 同意; 2 拒绝
        confirmTitle: '',
        placeholder: '',
		showConfirm: false,
        confirmBtn: { content: '确定', variant: 'base', loading: false },
        textareaValue: '',
    },
    onShowDialog(e) { // 显示弹窗
        const { status, type } = e.currentTarget.dataset;
        const confirmTitle = type == 1 ? '您确定要退款嘛？' : (type == 2 ? '您确定要通过嘛？' : '您确定要拒绝嘛？');
        const placeholder = type == 3 ? '请输入拒绝原因' : '请输入备注信息';
        this.setData({ actionStatus: status, confirmTitle, placeholder, showConfirm: true });
    },
    onChangeTextarea(e) {
        const detailValue = e.detail.value;
        this.setData({ textareaValue: detailValue });
    },
    async onSureDialog() { // 弹窗确认，同意/拒绝
		const { actionStatus, defaultValues, textareaValue } = this.data;
		const result = await useRequest(() => fetchAuditResult({ id: defaultValues['id'], status: actionStatus, remark: textareaValue }));
		if(result) {
			this.setData({ showConfirm: false });
			wx.showToast({ title: '操作成功', icon: 'success' });
			await delay(800);
			wx.navigateBack({ delta: 1, success: () => {
				const eventChannel = this.getOpenerEventChannel(); // 获取事件监听对象
				eventChannel.emit('acceptOpenedData', { ...defaultValues, status: actionStatus });
			}});
		}
    },
    onCancelDialog() { // 弹窗取消
        this.setData({ showConfirm: false });
    },
	async onLoad(options) {
		const result = await useRequest(() => fetchAuditDetail({ id: options['id'] }));
		if(result) {
			const title = result['type'] == 1 ? '取消任务' : (result['type'] == 2 ? '数量异常上报' : '规格异常上报');
			this.setData({ title, defaultValues: result });
		}
	}
})