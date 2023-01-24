export const VoteYesVerifierAbi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'proof',
        type: 'bytes',
      },
      {
        internalType: 'uint256[]',
        name: 'pubSignals',
        type: 'uint256[]',
      },
    ],
    name: 'verifyYesProof',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
