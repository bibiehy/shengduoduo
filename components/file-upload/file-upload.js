Component({
    behaviors: ['wx://form-field'],
    properties: {
        value: { type: Array, value: [] },
		disabled: { type: Boolean, value: false },
        remark: { type: String, value: '' }, // 对 label 字段的补充
        mediaType: { type: Array, value: ['image'] }, // ['video','image']
        count: { type: Number, value: 2 }, // 最多可以选择的文件个数
		draggable: { type: Boolean, value: false }, // 是否支持拖拽
		limit: { type: Number, value: 15360 }, // 单位 KB, 15360/1024 = 15M, 组件自己内部做了大小限制提醒
		uploadURL: { type: String, value: 'https://sddwl.tonglujipei.com/api/common/upload' }, // 上传地址
    },
    data: {
        fileList: [] // 图片列表
    },
    observers: {
        value: function(newValue) { // 监听外部传递的 value []
			this.setData({ fileList: newValue });
        }
    },
    methods: {
        handleAdd() {
			const { disabled, count, mediaType, limit } = this.data;
			if(!disabled) {
				const that = this;
				wx.chooseMedia({
					count: count, // 最多可以选择的文件个数
					mediaType: mediaType,
					sourceType: ['album', 'camera'], // album 相册; camera 使用相机拍摄;
					maxDuration: 30,
					sizeType: ['compressed'], // 是否压缩所选文件 ['original', 'compressed']
					camera: 'back', // 使用后置摄像头
					success(res) {
						// console.log(res.tempFiles[0].tempFilePath)
						// console.log(res.tempFiles[0].size)
						console.log(res);
						const tempFiles = res['tempFiles'];
						const failFiles = []; // 超过限制的图片
						tempFiles.forEach((file) => {
							if(file['size']/1024 > limit) {
								failFiles.push(file);
							}else{
								that.uploadFile(file);
							}
						});

						if(failFiles.length > 0) {
							wx.showToast({ title: '大小超过了限制', icon:'error' })
						}
					}
				});
			}
        },
        handleRemove(e) {
            const { index } = e.currentTarget.dataset;
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
            const { fileList, uploadURL } = this.data;
            this.setData({ fileList: [...fileList, { ...file, status: 'loading' }] });
    
            const { length } = fileList;
    
            wx.uploadFile({
                url: uploadURL,
                filePath: file['tempFilePath'],
                name: 'file',
                // formData: { user: 'test' }, // 额外参数
                success: (res) => {
                	this.setData({[`fileList[${length}].status`]: 'done'  }); // status: loading/failed/done;
				},
				fail: (res) => { // res = { errno: 1001, errMsg: '' }
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