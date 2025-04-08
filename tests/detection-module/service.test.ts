import 'reflect-metadata'
import { DetectionService } from '../../src/modules/detection-module/service'
import { DetectionRequestInterface } from '../../src/modules/detection-module/dtos/requests'

describe('DetectionService', () => {
    describe('detect', () => {
        it('should return error when trace is missing', async () => {
            const request: DetectionRequestInterface = {
                chainId: '1',
                hash: '0x123',
                from: '0xabc',
                to: '0xdef'
            }

            const result = await DetectionService.detect(request)
            expect(result.detected).toBe(false)
            expect(result.error).toBe('Missing trace data')
        })

        it('should return error when no logs are present', async () => {
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
                    logs: []
                }
            }

            const result = await DetectionService.detect(request)
            expect(result.detected).toBe(false)
            expect(result.error).toBe('No logs found in transaction')
        })

        it('should detect unlimited approval', async () => {
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

            const result = await DetectionService.detect(request)
            expect(result.detected).toBe(true)
            expect(result.details).toBeDefined()
            expect(result.details?.owner).toBe('0xabc123def456abc123def456abc123def456abc1')
            expect(result.details?.spender).toBe('0xdef456abc123def456abc123def456abc123def4')
            expect(result.details?.tokenAddress).toBe('0x6b175474e89094c44da98b954eedeac495271d0f')
        })

        it('should detect large amount approval', async () => {
            // Use a hardcoded large amount instead of ethers.parseUnits
            const largeAmount = '2000000000000000000000000' // 2 million tokens with 18 decimals
            
            // Pad the amount to 64 characters (32 bytes) and prefix with 0x
            const paddedAmount = '0x' + largeAmount.padStart(64, '0')
            
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
                            data: paddedAmount
                        }
                    ]
                }
            }

            const result = await DetectionService.detect(request)
            expect(result.detected).toBe(true)
            expect(result.details).toBeDefined()
            expect(result.details?.tokenAddress).toBe('0x6b175474e89094c44da98b954eedeac495271d0f')
        })

        it('should detect approval to untrusted address', async () => {
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

            const result = await DetectionService.detect(request)
            expect(result.detected).toBe(true)
            expect(result.details).toBeDefined()
            expect(result.details?.spender).toBe('0xbad456abc123def456abc123def456abc123def4')
        })

        it('should not detect normal approval to trusted address', async () => {
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

            const result = await DetectionService.detect(request)
            expect(result.detected).toBe(false)
        })
    })
}) 