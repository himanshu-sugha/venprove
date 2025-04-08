# Token Approval Detector

## Summary

The Token Approval Detector is a specialized module for monitoring and analyzing ERC-20 token approval transactions on EVM-compatible blockchains. It helps identify potentially risky approval patterns, such as unlimited approvals, large amounts, and approvals to suspicious or untrusted addresses.

## Features

- Detects ERC-20 token approval transactions
- Identifies multiple risk patterns:
  - Unlimited approvals (MAX_UINT256 value)
  - Large amount approvals (over 1M tokens)
  - Approvals to untrusted or suspicious addresses
- Provides detailed analysis of detected approval transactions
- Exposes an API endpoint for integration with other systems

## Implementation Details

The implementation consists of the following components:

1. **TokenApprovalDetector Service**: Core detection logic for identifying token approval transactions, extracting details, checking for risky conditions, and returning detection responses.

2. **Router**: API endpoint handler that exposes a POST endpoint at `/token-approval/detect`, handles request validation, processes detection requests, and returns formatted responses.

3. **Module Exports**: Clean exports for integration with the main application.

4. **Documentation**: Comprehensive README covering features, API endpoints, risk detection criteria, integration instructions, testing guidelines, and future enhancement possibilities.

5. **Tests**: Thorough unit tests covering various scenarios, including error handling, risky condition detection, and API endpoint validation.

6. **Example Usage**: Sample script demonstrating how to use the detector with real-world transaction examples.

## Risk Detection Criteria

Approvals are classified as risky based on the following conditions:

1. **Unlimited Approvals**: When a token owner approves a spender to use the maximum possible amount (MAX_UINT256), posing a significant security risk if the spender becomes compromised.

2. **Large Amount Approvals**: When the approved amount exceeds 1,000,000 tokens (adjusted for token decimals), indicating a potentially risky approval.

3. **Untrusted Address Approvals**: When tokens are approved to addresses not in the trusted list, which could lead to loss of funds if the spender is malicious.

## Usage

Send a POST request to `/token-approval/detect` with the transaction details to analyze it for risky approval patterns.

Example request body:
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

Example response for a risky approval:
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

## Future Enhancements

1. **More Token Standards**: Extend support to other token standards like ERC-721 and ERC-1155.
2. **Historical Pattern Analysis**: Implement analysis of past approval patterns to detect anomalies.
3. **Enhanced Risk Scoring**: Develop a more sophisticated risk scoring system.
4. **Integration with External Threat Intelligence**: Connect with external APIs to validate addresses against known scam lists.
5. **Customizable Risk Thresholds**: Allow users to configure their risk tolerance levels.
6. **Improved Address Recognition**: Enhance the address validation logic with a more comprehensive database of trusted/untrusted addresses. 