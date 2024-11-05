// 列表 params = { page, size, name }
export const fetchAuditList = (params) => ({ url: '/admin/check/getSystemCheckList', method: 'get', loading: false, delay: 500, data: { page: params['page'], size: 20, status: params['status'], keyword: params['keyword'] } });

// 获取详情
export const fetchAuditDetail = (params) => ({ url: `/admin/check/getSystemCheck/${params['id']}`, method: 'get', loading: true, delay: 500 });

// 审核通过/审核拒绝
export const fetchAuditResult = (params) => ({ url: `/admin/check/systemCheck`, method: 'post', loading: true, delay: 800, data: params });


