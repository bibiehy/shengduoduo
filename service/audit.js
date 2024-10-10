// 列表 params = { page, size, name }
export const fetchAuditList = (params) => ({ url: '/admin/check/getCheckList', method: 'get', loading: false, delay: 500, data: { page: params['page'], size: 20, status: params['status'], keyword: params['keyword'] } });

// 发货人审核
export const fetchAuditFahuoren = (params) => ({ url: '/admin/check/consignorCheck', method: 'post', loading: true, delay: 500, data: params });

// 干线司机审核
export const fetchAuditDriver = (params) => ({ url: '/admin/check/driverCheck', method: 'post', loading: true, delay: 500, data: params });

// 获取详情
export const fetchAuditDetail = (params) => ({ url: `/admin/check/getCheckUser/${params['id']}`, method: 'get', loading: true, delay: 500 });










