import { Expose, plainToInstance } from 'class-transformer'

import { DetectionRequest } from '@/modules/detection-module/dtos/requests'

export type DetectionResponseInitOpts = {
    request: DetectionRequest
    detectionInfo: {
        error?: boolean
        message?: string
        detected: boolean
    }
}

export interface DetectionResponse {
    detected: boolean
    error?: string
    details?: {
        owner: string
        spender: string
        amount: string
        tokenAddress: string
    }
}

export class DetectionResponse {
    requestId?: string
    chainId?: number
    detected: boolean
    error?: string
    protocolAddress?: string
    protocolName?: string
    additionalData?: Record<string, unknown>
    details?: {
        owner: string
        spender: string
        amount: string
        tokenAddress: string
    }

    constructor({
        request,
        detectionInfo: { error, detected },
    }: DetectionResponseInitOpts) {
        this.requestId = request.id ?? request.requestId ?? ''
        this.chainId = request.chainId ?? 0
        this.protocolAddress = ''
        this.protocolName = ''
        this.additionalData = {}
        this.error = error ? 'Error occurred' : undefined
        this.detected = detected
    }
}

class DetectionResponseDTO {
    @Expose()
    requestId!: string

    @Expose()
    chainId!: number

    @Expose()
    detected!: boolean

    @Expose()
    error?: string

    @Expose()
    protocolAddress?: string

    @Expose()
    protocolName?: string

    @Expose()
    details?: {
        owner: string
        spender: string
        amount: string
        tokenAddress: string
    }

    @Expose()
    additionalData?: Record<string, unknown>
}

export const toDetectionResponse = (detectorEntity: DetectionResponse): DetectionResponseDTO => {
    return plainToInstance(DetectionResponseDTO, detectorEntity)
}
