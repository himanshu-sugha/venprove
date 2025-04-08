import 'reflect-metadata'
import request from 'supertest'
import { app } from '../src/app'
import { DetectionRequestInterface } from '../src/modules/detection-module/dtos/requests'

describe('App', () => {
    it('should return 200 for health check', async () => {
        const response = await request(app).get('/health')
        expect(response.status).toBe(200)
    })

    it('should return 404 for unknown route', async () => {
        const response = await request(app).get('/unknown')
        expect(response.status).toBe(404)
    })

    it('should handle token approval detection', async () => {
        const response = await request(app)
            .post('/token-approval/detect')
            .send({
                chainId: '1',
                hash: '0x123',
                from: '0x123',
                to: '0x456',
                trace: {
                    gas: '0x0',
                    gasUsed: '0x0',
                    input: '0x0',
                    pre: {},
                    post: {},
                    logs: [{
                        topics: [
                            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                            '0x0000000000000000000000001234567890123456789012345678901234567890',
                            '0x000000000000000000000000bad_address_is_not_trusted_in_our_list'
                        ],
                        data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                        address: '0x6b175474e89094c44da98b954eedeac495271d0f' // DAI token
                    }]
                }
            } as DetectionRequestInterface)

        expect(response.status).toBe(200)
        expect(response.body.detected).toBe(true)
        expect(response.body.details).toBeDefined()
    })

    it('should handle invalid request body', async () => {
        const response = await request(app)
            .post('/token-approval/detect')
            .send({
                invalid: 'data'
            })

        expect(response.status).toBe(400)
    })

    it('should handle missing trace data', async () => {
        const response = await request(app)
            .post('/token-approval/detect')
            .send({
                chainId: '1',
                hash: '0x123',
                from: '0x123',
                to: '0x456'
            } as DetectionRequestInterface)

        expect(response.status).toBe(200)
        expect(response.body.detected).toBe(false)
        expect(response.body.error).toBe('Missing trace data')
    })
})
