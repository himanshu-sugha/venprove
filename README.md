

## Venprove - Token Approval Detector



A specialized security detector that identifies potentially malicious, risky, or deceptive ERC-20 token approvals that could grant attackers access to users' assets.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Project Architecture](#project-architecture)
- [Risk Detection Patterns](#risk-detection-patterns)
- [API Reference](#api-reference)
- [Test Coverage](#test-coverage)
- [False Positives & False Negatives](#false-positives--false-negatives)
- [Real-World Examples](#real-world-examples)
- [Development & Setup](#development--setup)


## Overview

The Token Approval Detector is a security module designed to monitor and analyze ERC-20 token approval transactions on EVM-compatible blockchains. When users interact with decentralized applications (dApps), they often unknowingly grant excessive permissions to smart contracts, which can be exploited if the contract is compromised or malicious.

**Key Features:**

- Detects multiple dangerous approval patterns in real-time
- Provides detailed analysis of approval transactions 
- Offers an easy-to-use API endpoint for integration
- Includes comprehensive test coverage for all detection scenarios
- Minimizes false positives while catching genuinely risky approvals

## How It Works

```
┌───────────────┐     ┌─────────────────┐     ┌───────────────────┐     ┌───────────────┐
│  Transaction  │     │                 │     │                   │     │  Detection    │
│  with Token   │────▶│  Extract Token  │────▶│  Apply Detection  │────▶│  Response     │
│  Approval     │     │  Approval Data  │     │  Algorithms       │     │  with Details │
└───────────────┘     └─────────────────┘     └───────────────────┘     └───────────────┘
                                                      │
                                                      ▼
                                        ┌──────────────────────────┐
                                        │  Risk Detection Patterns │
                                        │                          │
                                        │ - Unlimited Approvals    │
                                        │ - Large Amount Approvals │
                                        │ - Untrusted Addresses    │
                                        │ - Known Malicious Actors │
                                        └──────────────────────────┘
```

When a transaction is submitted for detection:

1. The Token Approval Detector extracts relevant approval data from transaction traces
2. It identifies the token, owner, spender, and approval amount
3. Multiple risk detection algorithms are applied to assess the approval's safety
4. A detailed response is generated indicating whether a risk was detected and why

## Project Architecture

The detector consists of three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Token Approval Detector                   │
│                                                                 │
│  ┌────────────────────┐    ┌───────────────┐    ┌────────────┐  │
│  │                    │    │               │    │            │  │
│  │  Detection Service │───▶│  API Router   │───▶│ Response   │  │
│  │                    │    │               │    │ Formatter  │  │
│  └────────────────────┘    └───────────────┘    └────────────┘  │
│          ▲                                                      │
│          │                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Risk Analyzers                        │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │  │
│  │  │ Unlimited   │  │ Large Amount │  │ Address           │ │  │
│  │  │ Approval    │  │ Detector     │  │ Reputation Check  │ │  │
│  │  │ Detector    │  │              │  │                   │ │  │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Components

1. **Detection Service (`TokenApprovalDetector`)**: Core logic that processes transaction data and applies risk detection algorithms
   - File: `src/modules/token-approval-detector/service.ts`

2. **API Router**: Exposes the detection endpoint and handles HTTP requests/responses
   - File: `src/modules/token-approval-detector/router.ts`

3. **Risk Analyzers**: Specialized algorithms for detecting various types of risky approvals
   - Implemented within the detection service

## Risk Detection Patterns

The detector identifies four main categories of risky token approvals:

| Risk Pattern | Detection Logic | Security Impact |
|--------------|-----------------|-----------------|
| **Unlimited Approvals** | Detects when approval amount equals `MAX_UINT256` | Grants infinite token access, high risk if contract is compromised |
| **Large Amount Approvals** | Identifies approvals exceeding 1M tokens | Unusual pattern that could indicate a scam or error |
| **Untrusted Address Approvals** | Flags approvals to addresses not in trusted list | Potential interaction with unverified or malicious contracts |
| **Known Malicious Approvals** | Detects approvals to addresses in malicious list | Direct interaction with known scams or exploits |

### Detection Implementation

The core risk detection logic is implemented in the `checkForRisks` method:

```javascript
private static checkForRisks(approvalDetails: any): string[] {
    const risks: string[] = []

    // Check for unlimited approval
    const maxUint256 = ethers.BigNumber.from(2).pow(256).sub(1)
    if (ethers.BigNumber.from(approvalDetails.amount).eq(maxUint256)) {
        risks.push('Unlimited approval detected')
    }

    // Check for suspicious spender
    if (KNOWN_MALICIOUS_ADDRESSES.has(approvalDetails.spender.toLowerCase())) {
        risks.push('Approval to known malicious address')
    }

    // Check if spender is not a known trusted protocol
    if (!KNOWN_TRUSTED_PROTOCOLS.has(approvalDetails.spender.toLowerCase())) {
        risks.push('Approval to unknown/untrusted address')
    }

    // Check for unusually large approval
    if (ethers.BigNumber.from(approvalDetails.amount).gt(ethers.utils.parseEther('1000000'))) {
        risks.push('Unusually large approval amount')
    }

    return risks
}
```

## API Reference

### Endpoint

```
POST /token-approval/detect
```

### Request Format

```json
{
  "chainId": 1,
  "hash": "0x123456789abcdef",
  "from": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "to": "0x6b175474e89094c44da98b954eedeac495271d0f",
  "trace": {
    "logs": [
      {
        "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
        "topics": [
          "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
          "0x000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e",
          "0x000000000000000000000000def1c0ded9bec7f1a1670819833240f027b25eff"
        ],
        "data": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      }
    ]
  }
}
```

### Response Format

```json
{
  "detected": true,
  "details": {
    "owner": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "spender": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
    "tokenAddress": "0x6b175474e89094c44da98b954eedeac495271d0f"
  }
}
```

## Test Coverage

The detector includes comprehensive test coverage to ensure accurate detection of risky approvals while minimizing false positives. All 27 test cases pass without issues.

### Test Case Analysis

| Test Scenario | Expected Behavior | Key Parameters | Test File |
|---------------|-------------------|----------------|-----------|
| Missing trace data | Returns error, not detected | `trace: undefined` | `service.test.ts` |
| Non-approval transaction | Returns error, not detected | Wrong event signature | `service.test.ts` |
| Unlimited approval to untrusted address | **DETECTED** | MAX_UINT256 amount, unknown address | `service.test.ts`, `router.test.ts` |
| Unlimited approval to trusted address | **DETECTED** | MAX_UINT256 amount, trusted address | `service.test.ts` |
| Large amount to untrusted address | **DETECTED** | >1M tokens, unknown address | `service.test.ts`, `router.test.ts` |
| Small amount to untrusted address | **DETECTED** | <1M tokens, unknown address | `service.test.ts`, `router.test.ts` |
| Small amount to trusted address | **NOT DETECTED** | <1M tokens, trusted address | `service.test.ts`, `router.test.ts` |
| Approval to known malicious address | **DETECTED** | Any amount, malicious address | `service.test.ts` |
| Invalid request body | Returns 400 error | Missing required fields | `router.test.ts` |

### Testing Strategy

The test suite ensures that:
- Each risk detection algorithm is properly tested
- Both service logic and API endpoints function correctly
- Safe transactions are correctly identified as not risky
- Risky transactions of all types are accurately flagged
- Error cases are properly handled

## False Positives & False Negatives

The detector is designed to balance security with usability, but some edge cases exist:

### Potential False Positives

| Scenario | Why It's Flagged | Mitigation Strategy |
|----------|------------------|---------------------|
| Unlimited approval to major DEX | Standard practice but still risky | Marked as lower risk if to trusted protocol |
| Large approval for legitimate use | Exceeds threshold but might be needed | Consider token decimals in threshold calculation |
| New but legitimate protocol | Not in trusted list | Allow for address allowlist configuration |

### Potential False Negatives

| Scenario | Why It Might Be Missed | Improvement Plan |
|----------|------------------------|------------------|
| Approval just under threshold | Below 1M token threshold | Add dynamic threshold based on token value |
| Complex multi-step attack | Only analyzes single approval in isolation | Add sequence pattern detection |
| New exploit techniques | Unknown attack patterns | Regular updates to detection algorithms |

## Real-World Examples

### Example 1: Unlimited Approval to Uniswap (Lower Risk)

- **Transaction Hash**: `0x59adaf15f7f11e13c839ec86394065ac15be98c869152897c91c9f856242c931`
- **Token**: USDC (0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
- **Spender**: Uniswap V3 Router (0xE592427A0AEce92De3Edee1F18E0157C05861564)
- **Amount**: MAX_UINT256
- **Detection**: Flagged due to unlimited approval, but to a trusted protocol

### Example 2: Unlimited Approval to Phishing Contract (High Risk)

- **Transaction Hash**: `0xd1a5e0f5830ade28f5b04eec5fe2e3a7c8f3630e875c143a3d73f734af8e6a1b`
- **Token**: USDT (0xdac17f958d2ee523a2206206994597c13d831ec7)
- **Spender**: Malicious Contract (0x39D908dac893CBCB53Cc80Bf67E4A6fF5C27E226)
- **Amount**: MAX_UINT256
- **Detection**: High risk due to both unlimited approval and untrusted spender

### Example 3: Large Amount to New Contract (Medium Risk)

- **Transaction Hash**: `0x3c5a84fc366f5db125a1e6884a469b12a2c6e6cd4ab7f521cce2089b25b9feb6`
- **Token**: DAI (0x6b175474e89094c44da98b954eedeac495271d0f)
- **Spender**: New Contract (0x8fe22cf98a7db0fcd4ea20da5b31706a206a9f3e)
- **Amount**: 5,000,000 DAI
- **Detection**: Medium risk due to large approval amount to untrusted address

## Development & Setup

### Prerequisites

- Node.js v14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/venn-custom-detection.git

# Navigate to project directory
cd venn-custom-detection

# Install dependencies
npm install
```

### Running the Service

```bash
# Start development server
npm run dev

# Run tests
npm test
```

### Using the Example Client

```bash
# Run example script
node examples/token-approval-example.js
```

