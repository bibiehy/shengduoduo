/*************************** 主页 *************************/
// 司机收益，本周和本月
export const fetchMainProfit = (params) => ({ url: '/driver/getTotalProfit', method: 'get' });

// 获取当前进行中的任务
export const fetchCurrentTask = (params) => ({ url: '/driver/getNeedTransportList', method: 'get', loading: true, delay: 500, data: params });

// 已收到通知
export const fetchReciveTask = (params) => ({ url: `/driver/accept`, method: 'post', loading: true, delay: 500, data: params });

// 发车
export const fetchFache = (params) => ({ url: `/driver/depart`, method: 'post', loading: true, delay: 500, data: params });

// 已送达
export const fetchTaskComplete = (params) => ({ url: `/driver/reachConfirm/${params['id']}`, method: 'post', loading: true, delay: 500 });

/*************************** 异常上报 *************************/

// 异常上报
const fetchExceptionReport = (params) => ({ url: '/driver/report', method: 'post', loading: true, delay: 500, data: params });

// 异常列表-暂时没有
const fetchExceptionList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { size: 20, ...params } });

// 查看异常 - 单个，用于调度员和提货点负责人
const fetchExceptionView = (params) => ({ url: `/driver/getException/${params['id']}`, method: 'get', loading: true, delay: 500 });

// 查看异常 - 全部，用于超管
const fetchExceptionViewAll = (params) => ({ url: `/driver/getException/${params['id']}`, method: 'get', loading: true, delay: 500 });

/*************************** 历史记录 *************************/

// 列表 params = { page, size, keyword, point_id }
export const fetchHistoryList = (params) => ({ url: '/driver/getHistoryList', method: 'get', data: { size: 20, ...params } });

/*************************** 我的收益 *************************/

// 列表 params = { page, size, beginTime, endTime, month }
export const fetchProfitList = (params) => ({ url: '/driver/getTransportList', method: 'get', data: { size: 20, ...params } });