/**
 * Token Approval Detector Example
 * 
 * This example demonstrates how to use the Token Approval Detector
 * to analyze transactions for potentially risky ERC-20 token approvals.
 */

// Sample transaction with unlimited approval
const unlimitedApprovalTx = {
    chainId: 1,
    hash: '0x123456789abcdef',
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI token address
    trace: {
        from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        to: '0x6b175474e89094c44da98b954eedeac495271d0f',
        gas: '0x1',
        gasUsed: '0x1',
        input: '0x095ea7b3000000000000000000000000def1c0ded9bec7f1a1670819833240f027b25eff0000000000000000000000000000000000000000ffffffffffffffffffffffff',
        logs: [
            {
                address: '0x6b175474e89094c44da98b954eedeac495271d0f',
                topics: [
                    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event signature
                    '0x000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e', // owner (padded)
                    '0x000000000000000000000000def1c0ded9bec7f1a1670819833240f027b25eff'  // spender (padded)
                ],
                data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' // max uint256 value
            }
        ]
    }
};

// Sample transaction with safe approval
const safeApprovalTx = {
    chainId: 1,
    hash: '0x987654321fedcba',
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI token address
    trace: {
        from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        to: '0x6b175474e89094c44da98b954eedeac495271d0f',
        gas: '0x1',
        gasUsed: '0x1',
        input: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000000de0b6b3a7640000',
        logs: [
            {
                address: '0x6b175474e89094c44da98b954eedeac495271d0f',
                topics: [
                    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event signature
                    '0x000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e', // owner (padded)
                    '0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d'  // spender (Uniswap V2 Router)
                ],
                data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' // 1 ETH worth of tokens
            }
        ]
    }
};

/**
 * Example usage with Node.js fetch API
 */
async function detectRiskyApproval(txData) {
    try {
        const response = await fetch('http://localhost:3000/token-approval/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(txData)
        });
        
        const result = await response.json();
        
        console.log(`Transaction ${txData.hash}:`);
        console.log(`- Detected: ${result.detected}`);
        
        if (result.detected) {
            console.log(`- Token Address: ${result.details.tokenAddress}`);
            console.log(`- Owner: ${result.details.owner}`);
            console.log(`- Spender: ${result.details.spender}`);
            console.log(`- Amount: ${result.details.amount}`);
        }
        
        if (result.error) {
            console.log(`- Error: ${result.error}`);
        }
        
        console.log('\n');
    } catch (error) {
        console.error('Error calling token approval detector:', error);
    }
}

/**
 * Run the examples
 */
async function runExamples() {
    console.log('Analyzing transactions for risky token approvals...\n');
    
    await detectRiskyApproval(unlimitedApprovalTx);
    await detectRiskyApproval(safeApprovalTx);
}

// Check if script is run directly
if (require.main === module) {
    runExamples();
}

module.exports = {
    unlimitedApprovalTx,
    safeApprovalTx,
    detectRiskyApproval,
    runExamples
}; 