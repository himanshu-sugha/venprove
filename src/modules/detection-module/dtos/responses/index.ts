export * from './detect-response'

export interface DetectionResponse {
    requestId?: string
    chainId?: number
    detected: boolean
    error: boolean
    message: string
}
