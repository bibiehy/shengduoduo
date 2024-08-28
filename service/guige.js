// 列表 params = { page, size, name }
export const fetchGuigeList = (params) => ({ url: '/admin/spec/queryByPage', method: 'get', loading: true, delay: 500, data: { page: 1, size: 1000, name: params['name'] } });

// 添加
export const fetchGuigeCreate = (params) => ({ url: '/admin/spec/add', method: 'post', loading: true, delay: 500, data: params });

// 编辑
export const fetchGuigeEdit = (params) => ({ url: '/admin/spec/edit', method: 'post', loading: true, delay: 500, data: params });

// 删除
export const fetchGuigeDelete = (params) => ({ url: `/admin/spec/delete/${params['id']}`, method: 'post', loading: true, delay: 500 });

// 禁用/启用
export const fetchGuigeDisabled = (params) => ({ url: `/admin/spec/disable/${params['id']}/${params['type']}`, method: 'post', loading: true, delay: 500 });


// 查看详情
export const fetchGuigeDetail = (params) => ({ url: `/admin/spec/getById/${params['id']}`, method: 'get', loading: true, delay: 500 });










