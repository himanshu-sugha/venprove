import 'reflect-metadata'
import request from 'supertest'
import { testApp } from '../setup'

describe('Token Approval Detector Router', () => {
    it('should return 400 for invalid request body', async () => {
        const response = await request(testApp)
            .post('/token-approval/detect')
            .send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
    })

    it('should detect unlimited approval', async () => {
        const mockRequest = {
            chainId: 1,
            hash: '0x123',
            from: '0xuser',
            to: '0xcontract',
            trace: {
                from: '0xuser',
                to: '0xtoken',
                gas: '0x1',
                gasUsed: '0x1',
                input: '0x1',
                pre: {},
                post: {},
                logs: [
                    {
                        address: '0xtoken',
                        topics: [
                            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                            '0x000000000000000000000000user_address_padded_to_32_bytes',
                            '0x000000000000000000000000bad_address_is_not_trusted_in_our_list'
                        ],
                        data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                    }
                ]
            }
        }

        const response = await request(testApp)
            .post('/token-approval/detect')
            .send(mockRequest)

        expect(response.status).toBe(200)
        expect(response.body.detected).toBe(true)
        expect(response.body.details).toHaveProperty('tokenAddress')
        expect(response.body.details).toHaveProperty('owner')
        expect(response.body.details).toHaveProperty('spender')
        expect(response.body.details).toHaveProperty('amount')
    })

    it('should detect large amount approval', async () => {
        const largeAmount = '2000000000000000000000000'
        
        const mockRequest = {
            chainId: 1,
            hash: '0x123',
            from: '0xuser',
            to: '0xcontract',
            trace: {
                from: '0xuser',
                to: '0xtoken',
                gas: '0x1',
                gasUsed: '0x1',
                input: '0x1',
                pre: {},
                post: {},
                logs: [
                    {
                        address: '0xtoken',
                        topics: [
                            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                            '0x000000000000000000000000user_address_padded_to_32_bytes',
                            '0x000000000000000000000000bad_address_is_not_trusted_in_our_list'
                        ],
                        data: '0x' + largeAmount.padStart(64, '0')
                    }
                ]
            }
        }

        const response = await request(testApp)
            .post('/token-approval/detect')
            .send(mockRequest)

        expect(response.status).toBe(200)
        expect(response.body.detected).toBe(true)
        expect(response.body.details).toHaveProperty('tokenAddress')
        expect(response.body.details).toHaveProperty('owner')
        expect(response.body.details).toHaveProperty('spender')
        expect(response.body.details).toHaveProperty('amount')
    })

    it('should detect approval to untrusted address', async () => {
        const mockRequest = {
            chainId: 1,
            hash: '0x123',
            from: '0xuser',
            to: '0xcontract',
            trace: {
                from: '0xuser',
                to: '0xtoken',
                gas: '0x1',
                gasUsed: '0x1',
                input: '0x1',
                pre: {},
                post: {},
                logs: [
                    {
                        address: '0xtoken',
                        topics: [
                            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                            '0x000000000000000000000000user_address_padded_to_32_bytes',
                            '0x000000000000000000000000bad_address_is_not_trusted_in_our_list'
                        ],
                        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
                    }
                ]
            }
        }

        const response = await request(testApp)
            .post('/token-approval/detect')
            .send(mockRequest)

        expect(response.status).toBe(200)
        expect(response.body.detected).toBe(true)
        expect(response.body.details).toHaveProperty('tokenAddress')
        expect(response.body.details).toHaveProperty('owner')
        expect(response.body.details).toHaveProperty('spender')
        expect(response.body.details).toHaveProperty('amount')
    })

    it('should not detect normal transaction to trusted address', async () => {
        const trustedAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
        
        const mockRequest = {
            chainId: 1,
            hash: '0x123',
            from: '0xuser',
            to: '0xcontract',
            trace: {
                from: '0xuser',
                to: '0xtoken',
                gas: '0x1',
                gasUsed: '0x1',
                input: '0x1',
                pre: {},
                post: {},
                logs: [
                    {
                        address: '0xtoken',
                        topics: [
                            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                            '0x000000000000000000000000user_address_padded_to_32_bytes',
                            '0x0000000000000000000000007a250d5630B4cF539739dF2C5dAcb4c659F2488D'
                        ],
                        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
                    }
                ]
            }
        }

        const response = await request(testApp)
            .post('/token-approval/detect')
            .send(mockRequest)

        expect(response.status).toBe(200)
        expect(response.body.detected).toBe(false)
        expect(response.body.details).toBeDefined()
    })
}) 