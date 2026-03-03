import http from './http'

// 队列信息接口
export interface Queue {
    id: number
    orderId: number
    patientId: number
    doctorId: number
    deptId: number
    isPriority: number
    queueNumber: number
    queueStatus: number
    checkInTime: string
    callTime: string
    startTime: string
    endTime: string
    missedCount: number
    maxMissedAllowed: number
    createTime: string
    updateTime: string
    patientName?: string
}

// // 队列状态枚举
// export enum QueueStatus {
//     WAITING = 1,     // 等待中
//     CALLED = 2,      // 已叫号
//     IN_PROGRESS = 3, // 接诊中
//     COMPLETED = 4,   // 已完成
//     MISSED = 5       // 失约
// }

// 当前队列查询响应
export interface CurrentQueueResponse {
    currentPatient?: Queue
    waitingList: Queue[]
    totalWaiting: number
    avgWaitTime: number
}

// 队列操作请求参数
export interface QueueOperationRequest {
    queueId: number
    remark?: string
}

export const queueApi = {
    // 查询当前排队队列
    getCurrentQueue: () => {
        return http.get('/doctor/current-queue')
    },

    // 医生叫号（根据最新API文档修改）
    callNext: () => {
        return http.post('/doctor/call-next')
    },

    // 开始治疗（新接口）
    startTreatment: (queueId: number) => {
        // 确保queueId是有效的数字
        if (!queueId || typeof queueId !== 'number') {
            return Promise.reject(new Error('无效的队列ID'))
        }
        return http.post(`/doctor/start-treatment/${queueId}`)
    },

    // 完成就诊（新接口）
    completeTreatment: (queueId: number) => {
        // 确保queueId是有效的数字
        if (!queueId || typeof queueId !== 'number') {
            return Promise.reject(new Error('无效的队列ID'))
        }
        return http.post(`/doctor/complete-treatment/${queueId}`)
    },

    // 处理过号患者（新接口）
    handleMissed: (queueId: number) => {
        // 确保queueId是有效的数字
        if (!queueId || typeof queueId !== 'number') {
            return Promise.reject(new Error('无效的队列ID'))
        }
        return http.post(`/doctor/handle-missed/${queueId}`)
    },

    // 获取队列详情
    getQueueDetail: (queueId: number) => {
        return http.get(`/doctor/queue/${queueId}`)
    },

    // 批量操作队列
    batchOperate: (operation: string, queueIds: number[]) => {
        return http.post(`/doctor/queue/batch/${operation}`, queueIds)
    },

    // 患者查询排队队列（根据API文档添加）
    getPatientQueueInfo: () => {
        return http.get('/patient/queue')
    }
}
