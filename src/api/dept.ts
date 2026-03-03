import http from './http'

// 科室创建
export interface DeptCreateDTO {
    name: string
    type: number
    location?: string
    status?: number
    description?: string
    directorId?: number
}

// 科室更新
export interface DeptUpdateDTO {
    id: number
    name: string
    type: number
    location?: string
    status?: number
    description?: string
    directorId?: number
}

// 科室状态更新
export interface DeptStatusUpdateDTO {
    id: number
    status: number
}

// 科室分页查询
export interface DeptPageQueryDTO {
    id?: number
    name?: string
    type?: number
    status?: number
    page: number
    pageSize: number
    sortBy?: string
    sortDir?: string
}

export const deptApi = {
    // 创建科室
    create: (data: DeptCreateDTO) => {
        return http.post('/dept/create', data)
    },

    // 分页查询科室
    pageQuery: (data: DeptPageQueryDTO) => {
        return http.post('/dept/page', data)
    },

    // 获取科室详情
    getById: (id: number) => {
        return http.get(`/dept/getById/${id}`)
    },

    // 获取所有启用科室
    getAllEnabled: () => {
        return http.get('/dept/getAllEnabled')
    },

    // 获取所有科室ID和名称
    getAllIdAndName: () => {
        return http.get('/dept/getAllIdAndName')
    },

    // 更新科室信息
    update: (data: DeptUpdateDTO) => {
        return http.put('/dept/update', data)
    },

    // 更新科室状态
    updateStatus: (data: DeptStatusUpdateDTO) => {
        return http.put('/dept/status', data)
    },

    // 删除科室
    delete: (id: number) => {
        return http.delete(`/dept/dept/delete/${id}`)
    }
}
