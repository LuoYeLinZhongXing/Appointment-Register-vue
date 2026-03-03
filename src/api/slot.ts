import http from './http'

// 号源放出
export interface SlotReleaseDTO {
    doctorId: number
    scheduleDate: string
    timePeriod: string
    feeAmount: number
    totalCount: number
}

// 号源分页查询
export interface SlotPageQueryDTO {
    doctorId?: number
    doctorName?: string
    startDate?: string
    endDate?: string
    timePeriod?: string
    status?: number
    page: number
    size: number
}

// 号源信息VO
export interface SlotVO {
    id: number
    deptId: number
    doctorId: number
    doctorName: string
    doctorPost: number
    feeAmount: number
    deptName: string
    scheduleDate: string
    timePeriod: string
    totalCount: number
    bookedCount: number
    remainingCount: number
    status: number
    doctorIntroduction: string
}

export const slotApi = {
    // 放出号源
    release: (data: SlotReleaseDTO) => {
        return http.post('/slot/release', data)
    },

    // 分页查询号源 - 修正为POST请求
    pageQuery: (data: SlotPageQueryDTO) => {
        return http.post('/slot/page', data)
    },

    // 根据ID获取号源
    getById: (slotId: number) => {
        return http.get(`/slot/getById/${slotId}`)
    },

    // 根据医生ID和日期查询号源
    getByDoctorAndDate: (doctorId: number, scheduleDate: string) => {
        return http.get('/slot/byDoctorAndDate', {
            params: { doctorId, scheduleDate }
        })
    },

    // 获取号源库存信息
    getInventoryInfo: (slotId: number) => {
        return http.get(`/slot/getInventoryInfo/${slotId}`)
    },

    // 删除号源
    delete: (slotId: number) => {
        return http.delete(`/slot/deleteById/${slotId}`)
    }
}
