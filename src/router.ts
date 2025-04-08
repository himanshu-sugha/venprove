import { Router } from 'express'

/* IMPORT ALL YOUR ROUTERS */
import { appRouter, detectionRouter } from '@/modules'
import { tokenApprovalRouter } from '@/modules/token-approval-detector'

const router = Router()

/* ROOT LEVEL HEALTH CHECK */
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' })
})

/* ASSIGN EACH ROUTER TO DEDICATED SUBROUTE */
router.use('/app', appRouter)
router.use('/detect', detectionRouter)
router.use('/token-approval', tokenApprovalRouter)

export { router }
