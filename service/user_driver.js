/*************************** 主页 *************************/
// 司机收益，本周和本月
export const fetchMainProfit = (params) => ({ url: '/dispatcher/getTotalProfit', method: 'get' });

// 获取当前进行中的任务
export const fetchCurrentTask = (params) => ({ url: '/driver/getNeedTransportList', method: 'get', loading: true, delay: 500, data: params });

// 已收到通知
export const fetchAcceptTask = (params) => ({ url: `/driver/accept/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 发车
export const fetchFache = (params) => ({ url: `/driver/depart/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 已送达
export const fetchTaskComplete = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'post', loading: true, delay: 500, data: params });

/*************************** 异常上报 *************************/

// 异常上报
const fetchExceptionReport = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

// 异常列表
const fetchExceptionList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { size: 20, ...params } });

// 异常查看
const fetchExceptionView = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

/*************************** 历史记录 *************************/

// 列表 params = { page, size, keyword, point_id }
export const fetchHistoryList = (params) => ({ url: '/driver/getHistoryList', method: 'get', data: { size: 20, ...params } });

/*************************** 我的收益 *************************/

// 列表 params = { page, size, beginTime, endTime, month }
export const fetchProfitList = (params) => ({ url: '/driver/getTransportList', method: 'get', data: { size: 20, ...params } });