/************************** 主页 ***********************/
// 获取最近一周创建的任务
export const fetchMainList = (params) => ({ url: '/consignor/getWeekTask', method: 'get', loading: true });

/************************** 收货人 ***********************/
// 获取收货人列表
export const fetchShouList = (params) => ({ url: '/consignor/getSenderListPage', method: 'get', data: { size: 20, ...params } });

// 删除
export const fetchShouDelete = (params) => ({ url: `/consignor/deleteSender/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 禁用/启用
export const fetchShouDisabled = (params) => ({ url: `/consignor/disableSender/${params['id']}/${params['type']}`, method: 'post', loading: true, delay: 500 });

// 添加
export const fetchShouCreate = (params) => ({ url: '/consignor/addSender', method: 'post', loading: true, delay: 500, data: params });

// 编辑
export const fetchShouEdit = (params) => ({ url: '/consignor/editSender', method: 'post', loading: true, delay: 500, data: params });

// 查看详情
export const fetchShouDetail = (params) => ({ url: `/consignor/getSender/${params['id']}`, method: 'get', loading: true, delay: 500 });


/************************** 任务管理 ***********************/
// 任务列表 size page keyword status begin_time end_time
export const fetchTaskList = (params) => ({ url: '/consignor/getTaskList', method: 'get', data: { size: 20, ...params } });

// 添加
export const fetchTaskCreate = (params) => ({ url: '/consignor/createTask', method: 'post', loading: true, delay: 500, data: params });

// 编辑
export const fetchTaskEdit = (params) => ({ url: '/consignor/editTask', method: 'post', loading: true, delay: 500, data: params });

// 删除
export const fetchTaskDelete = (params) => ({ url: '/consignor/deleteTask', method: 'post', loading: true, delay: 500, data: params });

// 确认发送
export const fetchTaskSend = (params) => ({ url: '/consignor/conformTask', method: 'post', loading: true, delay: 500, data: params });

// 支付下单接口
export const fetchTaskOrder = (params) => ({ url: '/consignor/preOrderTask', method: 'post', skipError: true, loading: true, delay: 500, data: params });

// 任务支付+确认发送
export const fetchTaskPay = (params) => ({ url: '/consignor/payTask', method: 'post', skipError: true, loading: true, delay: 500, data: params });

// 取消任务 id、reason
export const fetchTaskCancel = (params) => ({ url: '/consignor/cancelTask', method: 'post', loading: true, delay: 500, data: params });

// 查看任务异常
export const fetchTaskException = (params) => ({ url: `/consignor/getTaskException/${params['id']}`, method: 'get', loading: true, delay: 500 });

// 任务详情
export const fetchTaskDetail = (params) => ({ url: `/consignor/getTaskDetail/${params['id']}`, method: 'get', loading: true, delay: 500 });

// 根据集货中心和提货点ID获取规格列表
export const fetchTaskGuige = (params) => ({ url: `/consignor/getPickupAndSpec/${params['centerId']}/${params['pointId']}`, method: 'get' });

// 获取发货人下所有收货人
export const fetchAllShouhuoren = (params) => ({ url: `/consignor/getReceiverList/${params['id']}`, method: 'get' });










