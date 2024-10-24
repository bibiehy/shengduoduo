//
const app = getApp();

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: null,
        disabled: { type: Boolean, value: false },
        required: { type: Boolean, value: true }, // 是否必填
        remark: { type: String, value: '' }, // 对 label 字段的补充
        message: { type: String, value: '' }, // 必填后的错误提示内容
        mediaType: { type: Array, value: ['image'] }, // ['video','image']
        max: { type: Number, value: 0 }, // 值为 0 则不限制
		draggable: { type: Boolean, value: false }, // 是否支持拖拽
		limit: { type: Number, value: 15360 }, // 单位 KB, 15360/1024 = 15M, 组件自己内部做了大小限制提醒
    },
    data: {
        fileList: [], // 图片列表
        errTips: ''
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value，1.头像地址字符串，2.数组字符串，多值
			if(!newValue) {
				return false;
            }

			const { max } = this.data;
			const newFileList = max == 1 ? [{ url: newValue }] : newValue.map((value) => ({ url: value }));
			this.setData({ fileList: newFileList });
        }
    },
    methods: {
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
            this.setData({ fileList, errTips: '' });
		},
		handleDrop(e) {
			if(this.data.draggable) {
				const { files } = e.detail;
				this.setData({ fileList: files });
			}
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
					const response = JSON.parse(res['data']);
					const imgURL = response['data'];
                	this.setData({ [`fileList[${length}].status`]: 'done', [`fileList[${length}].url`]: imgURL, errTips: '' }); // status: loading/reload/failed/done; percent: 68
				},
				fail: (res, statusCode) => {
					this.setData({ [`fileList[${length}].status`]: 'failed', errTips: '图片上传失败，请删除重新上传'  });
				}
            });
        },               
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, fileList, message, max } = this.data;
            let isVerify = true;
            
            if(required) {
				const failList = fileList.filter((item) => item['status'] == 'failed');
                const errTips = failList.length > 0 ? '图片上传失败，请删除重新上传' : (fileList.length > 0 ? '' : (message || '图片不能为空，请上传'));
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

			const newFileList = max == 1 ? (fileList.length > 0 ? fileList[0]['url'] : '') : fileList.map((item) => item['url']);
            return { verify: isVerify, name, value: newFileList };
        },
        getFieldValue() {
			const { name, fileList, max } = this.data;
			const doneList = fileList.filter((item) => item['status'] == 'done');

			let newFileList = '';
			if(max == 1) {
				newFileList = doneList.length == 1 ? doneList[0]['url'] : '';
			}else{
				newFileList = doneList.map((item) => item['url']);
			}

            return { name, value: newFileList };
        },
        setFieldValue(newValue) {
			const { max } = this.data;

			let newFileList = '';
			if(max == 1) {
				newFileList = newValue ? [{ url: newValue }] : [];
			}else{
				newFileList = newValue.map((value) => ({ url: value }));
			}

            this.setData({ fileList: newFileList });
        }
    }
})