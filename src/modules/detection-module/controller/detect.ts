import { Request, Response } from 'express'

import { logger } from '@/app'
import { ErrorHandler, validateRequest } from '@/helpers'
import { DetectionRequestInterface } from '../dtos/requests'
import { DetectionService } from '@/modules/detection-module/service'

export const detect = async (req: Request, res: Response) => {
    try {
        // Create a new request object from req.body
        const request = req.body as DetectionRequestInterface

        logger.debug(`detect request started. Request chainId: ${request.chainId}`)

        // validate request
        // await validateRequest(request)

        // perform business logic
        const result = await DetectionService.detect(request)

        logger.debug('detect request finished successfully')

        // return response
        res.json({
            chainId: request.chainId,
            ...result
        })
    } catch (error) {
        // handle errors
        ErrorHandler.processApiError(res, error)
    }
} 