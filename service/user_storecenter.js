/************************** 主页 ***********************/
// 待揽件列表 - 改为全部
export const fetchMainList = (params) => ({ url: '/collectCenter/getWaitingTaskList', method: 'get', loading: false });


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