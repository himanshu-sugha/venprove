import { Type } from 'class-transformer'
import {
    IsArray,
    IsEthereumAddress,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
    IsNotEmpty,
} from 'class-validator'

export class DetectionRequestTraceLog {
    @IsEthereumAddress()
    @IsString()
    address!: string

    @IsString()
    data!: string

    @IsArray()
    @IsString({ each: true })
    topics!: string[]
}

export class DetectionRequestTraceCall {
    @IsEthereumAddress()
    @IsString()
    from!: string

    @IsEthereumAddress()
    @IsString()
    to!: string

    @IsString()
    input!: string

    @IsString()
    @IsOptional()
    output?: string

    @IsString()
    @IsOptional()
    value?: string

    @IsString()
    gasUsed!: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetectionRequestTraceCall)
    @IsOptional()
    calls?: DetectionRequestTraceCall[]
}

export class DetectionRequestTrace {
    @IsString()
    @IsOptional()
    transactionHash?: string

    @IsNumber()
    @IsOptional()
    blockNumber?: number

    @IsEthereumAddress()
    @IsString()
    from!: string

    @IsEthereumAddress()
    @IsString()
    to!: string

    @IsString()
    @IsOptional()
    value?: string

    @IsString()
    gas!: string

    @IsString()
    gasUsed!: string

    @IsString()
    input!: string

    @IsString()
    @IsOptional()
    output?: string

    @IsObject()
    pre!: Record<string, DetectionRequestState>

    @IsObject()
    post!: Record<string, DetectionRequestState>

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetectionRequestTraceCall)
    @IsOptional()
    calls?: DetectionRequestTraceCall[]

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DetectionRequestTraceLog)
    logs?: DetectionRequestTraceLog[]
}

export class DetectionRequestState {
    @IsString()
    balance!: string

    @IsOptional()
    @IsNumber()
    nonce?: number

    @IsOptional()
    @IsString()
    code?: string

    @IsOptional()
    @IsObject()
    storage?: Record<string, string>
}

export class Trace {
    @IsString()
    @IsNotEmpty()
    gas: string

    @IsString()
    @IsNotEmpty()
    gasUsed: string

    @IsString()
    @IsNotEmpty()
    input: string

    @IsObject()
    @IsNotEmpty()
    pre: Record<string, any>

    @IsObject()
    @IsNotEmpty()
    post: Record<string, any>
}

export class DetectionRequest {
    @IsString()
    @IsNotEmpty()
    chainId: string

    @IsString()
    @IsNotEmpty()
    hash: string

    @IsString()
    @IsNotEmpty()
    from: string

    @IsString()
    @IsNotEmpty()
    to: string

    @ValidateNested()
    @Type(() => Trace)
    trace: Trace

    @IsString()
    @IsOptional()
    detectorName?: string

    @IsString()
    @IsOptional()
    id?: string

    @IsString()
    @IsOptional()
    protocolName?: string

    @IsEthereumAddress()
    @IsString()
    @IsOptional()
    protocolAddress?: string

    @IsObject()
    @IsOptional()
    additionalData?: Record<string, unknown>
}
