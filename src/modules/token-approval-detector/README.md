# Token Approval Detector

This module implements a custom detector for monitoring and analyzing token approval transactions on EVM-compatible blockchains. It helps identify potentially risky or malicious token approvals that could lead to unauthorized access to user assets.

## Features

- Detects ERC-20 token approval transactions
- Identifies risky approval patterns:
  - Unlimited approvals (max uint256)
  - Unusually large approval amounts
  - Approvals to suspicious addresses
- Provides detailed risk analysis and alerts

## API Endpoints

### POST /token-approval/detect

Analyzes a transaction for token approval risks.

#### Request Body

The request should follow the standard Venn detection request format, containing transaction details and trace information.

#### Response

```json
{
    "requestId": "string",
    "chainId": number,
    "detected": boolean,
    "error": boolean,
    "message": "string",
    "protocolAddress": "string",
    "protocolName": "string",
    "additionalData": {}
}
```

## Risk Detection Criteria

The detector classifies an approval as risky if it meets any of the following criteria:

1. **Unlimited Approvals**: When the approval amount is set to the maximum possible value (2^256 - 1)
2. **Large Approvals**: When the approval amount exceeds 1,000,000 tokens
3. **Suspicious Spenders**: When the spender address is not recognized as part of a trusted protocol

## Integration

To use this detector:

1. Ensure the `ethers` package is installed
2. Import the `TokenApprovalDetector` class
3. Call the `detect` method with a valid `DetectionRequest`

Example:
```typescript
import { TokenApprovalDetector } from './token-approval-detector'
import { DetectionRequest } from '../detection-module/dtos/requests'

const request = new DetectionRequest(transactionData)
const response = TokenApprovalDetector.detect(request)
```

## Testing

The detector can be tested by sending various approval transaction scenarios:

1. Normal approvals to trusted protocols
2. Unlimited approvals
3. Large amount approvals
4. Approvals to suspicious addresses

## Future Enhancements

- Add support for more token standards (ERC-721, ERC-1155)
- Implement historical pattern analysis
- Add integration with external threat intelligence feeds
- Support for custom risk thresholds
- Enhanced logging and monitoring capabilities 