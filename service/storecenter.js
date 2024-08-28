// 列表 params = { page, size, name }
export const fetchStoreCenterList = (params) => ({ url: '/admin/collectCenter/queryByPage', method: 'get', data: { size: 20, ...params } });

// 添加
export const fetchStoreCenterCreate = (params) => ({ url: '/admin/collectCenter/add', method: 'post', loading: true, delay: 500, data: params });

// 编辑
export const fetchStoreCenterEdit = (params) => ({ url: '/admin/collectCenter/edit', method: 'post', loading: true, delay: 500, data: params });

// 删除
export const fetchStoreCenterDelete = (params) => ({ url: `/admin/collectCenter/delete/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 禁用/启用
export const fetchStoreCenterDisabled = (params) => ({ url: `/admin/collectCenter/disable/${params['id']}/${params['type']}`, method: 'post', loading: true, delay: 500 });

// 查看详情
export const fetchStoreCenterDetail = (params) => ({ url: `/admin/collectCenter/getById/${params['id']}`, method: 'get', loading: true, delay: 500 });










