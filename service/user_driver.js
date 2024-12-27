/*************************** 主页 *************************/
// 获取当前进行中的任务
export const fetchCurrentTask = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

// 接受
export const fetchAcceptTask = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

// 拒绝
export const fetchRefuseTask = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

// 发车
export const fetchFache = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

// 已送达
export const fetchTaskComplete = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

/*************************** 异常上报 *************************/

// 异常上报
const fetchExceptionReport = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

// 异常列表
const fetchExceptionList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { size: 20, ...params } });

// 异常查看
const fetchExceptionView = (params) => ({ url: '/dispatcher/getCollectStaData', method: 'get', loading: true, delay: 500, data: params });

/*************************** 历史记录 *************************/

// 列表 params = { page, size, keyword, point_id }
export const fetchHistoryList = (params) => ({ url: '/dispatcher/getDriverList', method: 'get', data: { size: 20, ...params } });

/*************************** 我的收益 *************************/

// 列表 params = { page, size }
export const fetchProfitList = (params) => ({ url: '/dispatcher/getDriverSummary', method: 'get', data: { size: 20, ...params } });