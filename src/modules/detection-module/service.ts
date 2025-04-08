import { DetectionRequestInterface } from './dtos/requests'
import { DetectionResponse } from './dtos/responses/detect-response'
import { ethers } from 'ethers'

// ERC20 Approval event signature
const APPROVAL_EVENT_SIGNATURE = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'

const ERC20_APPROVAL_EVENT = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const LARGE_AMOUNT_THRESHOLD = ethers.BigNumber.from('0xde0b6b3a7640000') // 1 ETH for testing

/**
 * DetectionService
 *
 * Implements a `detect` method that receives an enriched view of an
 * EVM compatible transaction (i.e. `DetectionRequest`)
 * and returns a `DetectionResponse`
 *
 * API Reference:
 * https://github.com/ironblocks/venn-custom-detection/blob/master/docs/requests-responses.docs.md
 */
export class DetectionService {
    private static readonly trustedAddresses: Set<string> = new Set([
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase(), // Uniswap V2 Router
        '0xE592427A0AEce92De3Edee1F18E0157C05861564'.toLowerCase(), // Uniswap V3 Router
        '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'.toLowerCase()  // SushiSwap Router
    ])

    public static async detect(request: DetectionRequestInterface): Promise<DetectionResponse> {
        try {
            // Validate input
            if (!request.trace) {
                return {
                    detected: false,
                    error: 'Missing trace data'
                }
            }

            if (!request.trace.logs || request.trace.logs.length === 0) {
                return {
                    detected: false,
                    error: 'No logs found in transaction'
                }
            }

            // Check if this is a token approval transaction
            const approvalLog = request.trace.logs.find(log => 
                log.topics && log.topics.length > 0 && log.topics[0] === ERC20_APPROVAL_EVENT
            )

            if (!approvalLog) {
                return {
                    detected: false,
                    error: 'Not a token approval transaction'
                }
            }

            // Extract approval details
            const owner = '0x' + approvalLog.topics[1].substring(26)
            const spender = '0x' + approvalLog.topics[2].substring(26)
            const amount = ethers.BigNumber.from(approvalLog.data).toString()
            const tokenAddress = approvalLog.address
            const spenderLowerCase = spender.toLowerCase()
            const isTrustedAddress = this.trustedAddresses.has(spenderLowerCase)

            // Check for risky conditions
            const maxUint256 = ethers.BigNumber.from(2).pow(256).sub(1).toString()
            const isUnlimited = amount === maxUint256
            const isLargeAmount = ethers.BigNumber.from(amount).gte(ethers.utils.parseEther('1'))
            
            // For trusted addresses, only unlimited approvals are risky
            // For untrusted addresses, any approval is risky
            let isRisky = !isTrustedAddress || isUnlimited

            // Create response with details
            const response: DetectionResponse = {
                detected: isRisky,
                details: {
                    owner,
                    spender,
                    amount,
                    tokenAddress
                }
            }

            return response
        } catch (error) {
            return {
                detected: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }
}
