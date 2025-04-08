export * from './detect-request'

export interface Log {
    topics: string[]
    data: string
    address: string
}

export interface Trace {
    gas: string
    gasUsed: string
    input: string
    pre: Record<string, any>
    post: Record<string, any>
    logs: Log[]
}

// This interface provides compatibility with our test files
export interface DetectionRequestInterface {
    chainId: string
    hash: string
    from: string
    to: string
    trace?: Trace
}
