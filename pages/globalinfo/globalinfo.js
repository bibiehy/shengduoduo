import useRequest from '../../utils/request';
import { fetchGetGlobalInfo, fetchSetGlobalInfo } from '../../service/global';
import { form, delay } from '../../utils/tools';

//
const app = getApp();

Page({
	data: {
		detail: {},
		fileList: [], // 图片列表
	},
	handleAdd(e) {
		const { files } = e.detail;
		files.forEach((file) => { // 组件自己内部做了大小限制提醒
			this.uploadFile(file);				
		});
	},
	handleRemove(e) {
		const { index } = e.detail;
		const { fileList } = this.data;
		fileList.splice(index, 1);
		this.setData({ fileList });
	},
	handleDrop(e) {
		const { files } = e.detail;
		this.setData({ fileList: files });
	},
	uploadFile(file) {
		const { fileList } = this.data;
		this.setData({ fileList: [...fileList, { ...file, status: 'loading' }] });

		const { length } = fileList;

		wx.uploadFile({
			url: app.uploadURL,
			filePath: file.url,
			name: 'file',
			// formData: { user: 'test' }, // 额外参数
			success: (res) => {
				this.setData({ [`fileList[${length}].status`]: 'done' }); // status: loading/reload/failed/done; percent: 68
			},
			fail: (res, statusCode) => {
				this.setData({ [`fileList[${length}].status`]: 'failed'  });
			}
		});
	}, 
	async onSave() {
		const formValues = form.validateFields(this, ['formInputRate', 'formTextareaDesc']);
		if(formValues) {
			const { fileList } = this.data;

			if(fileList.length <= 0) {
				wx.showToast({ title: '请上传轮播图', icon: 'error' });
				return false;
			}

			const failList = fileList.filter((item) => item['status'] == 'failed');
			if(failList.length > 0) {
				wx.showToast({ title: '存在失败的图片', icon: 'error' });
				return false;
			}

			const fileURL = fileList.map((item) => item['url']);
			formValues['banner'] = fileURL;
			formValues['id'] = 1;
			const result = await useRequest(() => fetchSetGlobalInfo(formValues));
			if(result) {
				wx.showToast({ title: '保存成功', icon: 'success', duration: 2000 });
				await delay(2000);
				wx.navigateBack();
			}
		}
	},
	async onLoad(options) {
		const result = await useRequest(() => fetchGetGlobalInfo());
		if(result) {
			const fileList = result['banner'].map((imgURL) => ({ url: imgURL }));
			this.setData({ detail: { ...result }, fileList });
		}
	},
	onReady() {

	}
});