import http from './http'

// 挂号
export interface RegisterDTO {
    slotId: number
    isEmergency: number
}

// 患者取号DTO
export interface OrderCheckInDTO {
    orderId: number
}

// 取消订单原因
export interface CancelOrderReason {
    reason: string
}

// 订单分页查询DTO - 根据API文档调整
export interface OrderPageQueryDTO {
    orderNo?: string
    slotId?: number
    orderStatus?: number
    isEmergency?: number
    page: number
    size: number
    sortBy?: string
    sortDir?: string
}

// 订单详情VO
export interface OrderVO {
    id: number
    orderNo: string
    patientId: number
    patientName: string
    doctorId: number
    doctorName: string
    deptId: number
    deptName: string
    slotId: number
    scheduleDate: string
    timePeriod: string
    feeAmount: number
    isEmergency: number
    orderStatus: number  // 1:待支付 2:已支付 3:已取消 4:已就诊
    createTime: string   // 创建时间
    paymentTime?: string // 支付时间（可选）
    checkInTime?: string // 报到时间（可选）
    cancelTime?: string  // 取消时间（可选）
}

export const orderApi = {
    // 患者挂号
    register: (data: RegisterDTO) => {
        return http.post('/order/register', data)
    },

    // 分页查询订单
    pageQuery: (data: OrderPageQueryDTO) => {
        return http.post('/order/page', data)
    },

    // 查询订单信息
    getOrderById: (orderId: number) => {
        return http.get(`/order/${orderId}`)
    },

    // 支付订单
    payOrder: (orderId: number) => {
        return http.post(`/order/pay/${orderId}`)
    },

    // 完成订单
    completeOrder: (orderId: number) => {
        return http.post(`/order/complete/${orderId}`)
    },

    // 取消订单
    cancelOrder: (orderId: number, reason: CancelOrderReason) => {
        return http.post(`/order/cancel/${orderId}`, reason)
    },

    // 查询患者订单列表
    getPatientOrders: () => {
        return http.get('/order/patient/orders')
    },

    // 患者取号（报到）
    checkInOrder: (data: OrderCheckInDTO) => {
        return http.post('/order/check-in', data)
    }
}
