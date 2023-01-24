export const VoteNoVerifierAbi = [
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
    name: 'verifyNoProof',
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
