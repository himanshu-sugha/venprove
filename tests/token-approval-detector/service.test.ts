import 'reflect-metadata'
import { TokenApprovalDetector } from '../../src/modules/token-approval-detector/service'
import { DetectionRequestInterface } from '../../src/modules/detection-module/dtos/requests'

describe('TokenApprovalDetector', () => {
    describe('detect', () => {
        it('should return error when trace is missing', () => {
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef'
            }

            const result = TokenApprovalDetector.detect(request)
            expect(result.detected).toBe(false)
            expect(result.error).toBe('Missing trace data')
        })

        it('should return error when not an approval transaction', () => {
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef',
                trace: {
                    gas: '0x1',
                    gasUsed: '0x1',
                    input: '0x',
                    pre: {},
                    post: {},
                    logs: [
                        {
                            address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI address
                            topics: [
                                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
                                '0x000000000000000000000000abc123def456abc123def456abc123def456abc1',
                                '0x000000000000000000000000def456abc123def456abc123def456abc123def4'
                            ],
                            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
                        }
                    ]
                }
            }

            const result = TokenApprovalDetector.detect(request)
            expect(result.detected).toBe(false)
            expect(result.error).toBe('Not an approval transaction')
        })

        it('should detect unlimited approval', () => {
            const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef',
                trace: {
                    gas: '0x1',
                    gasUsed: '0x1',
                    input: '0x',
                    pre: {},
                    post: {},
                    logs: [
                        {
                            address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI address
                            topics: [
                                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event
                                '0x000000000000000000000000abc123def456abc123def456abc123def456abc1', // owner (padded)
                                '0x000000000000000000000000def456abc123def456abc123def456abc123def4'  // spender (padded)
                            ],
                            data: MAX_UINT256
                        }
                    ]
                }
            }

            const result = TokenApprovalDetector.detect(request)
            expect(result.detected).toBe(true)
            expect(result.details).toBeDefined()
            expect(result.details?.owner.toLowerCase()).toBe('0xabc123def456abc123def456abc123def456abc1'.toLowerCase())
            expect(result.details?.spender.toLowerCase()).toBe('0xdef456abc123def456abc123def456abc123def4'.toLowerCase())
            expect(result.details?.tokenAddress.toLowerCase()).toBe('0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase())
        })

        it('should detect large amount approval', () => {
            // Large amount (over 1M tokens with 18 decimals)
            const largeAmount = '0x' + '1'.padEnd(25, '0').padStart(64, '0')
            
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef',
                trace: {
                    gas: '0x1',
                    gasUsed: '0x1',
                    input: '0x',
                    pre: {},
                    post: {},
                    logs: [
                        {
                            address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI address
                            topics: [
                                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event
                                '0x000000000000000000000000abc123def456abc123def456abc123def456abc1', // owner (padded)
                                '0x000000000000000000000000def456abc123def456abc123def456abc123def4'  // spender (padded)
                            ],
                            data: largeAmount
                        }
                    ]
                }
            }

            const result = TokenApprovalDetector.detect(request)
            expect(result.detected).toBe(true)
            expect(result.details).toBeDefined()
            expect(result.details?.tokenAddress.toLowerCase()).toBe('0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase())
        })

        it('should detect approval to untrusted address', () => {
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef',
                trace: {
                    gas: '0x1',
                    gasUsed: '0x1',
                    input: '0x',
                    pre: {},
                    post: {},
                    logs: [
                        {
                            address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI address
                            topics: [
                                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event
                                '0x000000000000000000000000abc123def456abc123def456abc123def456abc1', // owner (padded)
                                '0x000000000000000000000000bad456abc123def456abc123def456abc123def4'  // untrusted spender (padded)
                            ],
                            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' // 1 token with 18 decimals
                        }
                    ]
                }
            }

            const result = TokenApprovalDetector.detect(request)
            expect(result.detected).toBe(true)
            expect(result.details).toBeDefined()
            expect(result.details?.spender.toLowerCase()).toBe('0xbad456abc123def456abc123def456abc123def4'.toLowerCase())
        })

        it('should not detect normal approval to trusted address', () => {
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef',
                trace: {
                    gas: '0x1',
                    gasUsed: '0x1',
                    input: '0x',
                    pre: {},
                    post: {},
                    logs: [
                        {
                            address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI address
                            topics: [
                                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event
                                '0x000000000000000000000000abc123def456abc123def456abc123def456abc1', // owner (padded)
                                '0x0000000000000000000000007a250d5630B4cF539739dF2C5dAcb4c659F2488D'  // Uniswap router (trusted)
                            ],
                            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' // 1 token with 18 decimals
                        }
                    ]
                }
            }

            const result = TokenApprovalDetector.detect(request)
            expect(result.detected).toBe(false)
            expect(result.details).toBeDefined()
        })
    })
}) 