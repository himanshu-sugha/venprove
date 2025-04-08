import { Request, Response, NextFunction } from 'express'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'

export const validationMiddleware = (type: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToClass(type, req.body)
        const errors = await validate(dto)

        if (errors.length > 0) {
            const errorMessages = errors.map(error => {
                const constraints = error.constraints || {}
                return Object.values(constraints).join(', ')
            })

            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errorMessages
            })
        }

        req.body = dto
        next()
    }
} 