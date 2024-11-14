/************************** 主页 ***********************/
// 待揽件列表 - 改为全部
export const fetchMainList = (params) => ({ url: '/collectCenter/getWaitingTaskList', method: 'get', data: params || {}, loading: false });

// 确认揽件 params: { id }
export const fetchSureLanjian = (params) => ({ url: '/collectCenter/conformCollecting', method: 'post', data: params, loading: true, delay: 800 });

/************************** 分拣员 ***********************/
// 获取分拣员列表
export const fetchFenList = (params) => ({ url: '/collectCenter/getSorterListPage', method: 'get', data: { size: 20, ...params } });

// 查看详情
export const fetchFenDetail = (params) => ({ url: `/collectCenter/getSorter/${params['id']}`, method: 'get', loading: true, delay: 500 });

// 删除
export const fetchFenDelete = (params) => ({ url: `/collectCenter/deleteSorter/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 添加
export const fetchFenCreate = (params) => ({ url: '/collectCenter/addSorter', method: 'post', loading: true, delay: 500, data: params });

// 编辑
export const fetchFenEdit = (params) => ({ url: '/collectCenter/editSorter', method: 'post', loading: true, delay: 500, data: params });

// 禁用/启用 - 增加
export const fetchFenDisabled = (params) => ({ url: `/consignor/disableSender/${params['id']}/${params['type']}`, method: 'post', loading: true, delay: 500 });


/************************** 任务管理 ***********************/
// 任务列表 size page keyword status - 改为 keyword，全部、待揽件、已揽件、已分拣
export const fetchTaskList = (params) => ({ url: '/collectCenter/getTaskList', method: 'get', data: { size: 20, ...params } });

// 任务详情
export const fetchTaskDetail = (params) => ({ url: `/collectCenter/getSorterTaskDetail/${params['id']}`, method: 'get', loading: true, delay: 500 });

// 任务异常上报
export const fetchTaskReport = (params) => ({ url: `/collectCenter/reportException`, method: 'post', loading: true, delay: 500 });

// 分拣数据保存
export const fetchFenjianSave = (params) => ({ url: `/collectCenter/sorter`, method: 'post', loading: true, delay: 500 });

// 分拣完成
export const fetchFenjianFinish = (params) => ({ url: `/collectCenter/finish`, method: 'post', loading: true, delay: 500 });

// 根据集货中心ID和提货点ID获取其卡板列表
export const fetchKabanList = (params) => ({ url: `/collectCenter/getCardNoList/${params['centerId']}/${params['pointId']}` });

// 点击分拣判断当前任务是否有人正在分拣，没有人分拣 data: null 程序直接锁，有人在分拣返回分拣人信息
export const fetchIsFenjian = (params) => ({ url: `/collectCenter/getLastSorter/${params['id']}`, loading: true, delay: 500 });

// 锁任务/解开任务 params: { id, status }  status: 1 锁任务，2 解开锁(保存或分拣完成自动解锁，如果页面关闭也要解锁)
export const fetchTaskJieSuo = (params) => ({ url: `/collectCenter/occupySorter`, method: 'post', data: params });









