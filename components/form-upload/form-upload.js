
//
const app = getApp();

Component({
    behaviors: ['wx://form-field'],
    properties: {
        label: { type: String, value: '' },
        name: { type: String, value: '' },
        value: { type: Array, value: [] },
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
        value: function(newValue) { // 监听外部传递的 value []
			this.setData({ fileList: newValue });
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
            this.setData({ fileList });
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
                	this.setData({[`fileList[${length}].status`]: 'done'  }); // status: loading/reload/failed/done; percent: 68
				},
				fail: (res, statusCode) => {
					console.log(res, statusCode);
					this.setData({[`fileList[${length}].status`]: 'failed'  });
				}
            });
        },               
        // 以下是对外的方法
        getFieldVerify() { // 获取校验后的表单值
            const { required, name, fileList, message } = this.data;
            let isVerify = true;
            
            if(required) {
                const errTips = fileList.length > 0 ? '' : (message || '图片不能为空，请上传');
                isVerify = errTips ? false : true;
                this.setData({ errTips });
            }            

            return { verify: isVerify, name, value: fileList };
        },
        getFieldValue() {
            const { name, fileList } = this.data;
            return { name, value: fileList };
        },
        setFieldValue(newValue) {
            this.setData({ fileList: newValue });
        }
    }
})