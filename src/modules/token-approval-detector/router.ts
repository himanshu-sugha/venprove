import { Router } from 'express'
import { TokenApprovalDetector } from './service'
import { DetectionRequestInterface } from '../detection-module/dtos/requests'

const router = Router()

router.post('/detect', async (req, res) => {
    try {
        // Basic validation
        const { chainId, hash, from, to, trace } = req.body

        if (!chainId || !hash || !from || !to) {
            return res.status(400).json({
                error: true,
                message: 'Invalid request. Missing required fields: chainId, hash, from, to'
            })
        }

        // Ensure we have a valid request object
        const request = req.body as DetectionRequestInterface
        
        // Run the detection
        const result = TokenApprovalDetector.detect(request)
        
        // Return the result
        return res.json(result)
    } catch (error) {
        console.error('Error in token approval detection:', error)
        return res.status(500).json({
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        })
    }
})

export const tokenApprovalRouter = router 