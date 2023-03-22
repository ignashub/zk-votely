// src/hooks/useJoinBallot.ts
import { useState, useEffect } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { BigNumber } from 'ethers';
import { Identity } from '@semaphore-protocol/identity';

export const useJoinBallot = (pollId: string, identityCommitment: string) => {
  const [readyToJoin, setReadyToJoin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { config, error } = usePrepareContractWrite(
    readyToJoin
      ? {
          address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
          abi: SemaphoreVotingAbi,
          functionName: 'addVoter',
          args: [pollId.toString(), identityCommitment],
        }
      : {}
  );

  const contractWrite = config ? useContractWrite(config) : null;

  useEffect(() => {
    if (config && contractWrite && typeof contractWrite.write === 'function') {
      setIsReady(true);
      contractWrite.write().catch((err) => {
        console.error('Error calling write function:', err);
      });
    }
  }, [config, contractWrite]);

  const castVote = () => {
    if (!isReady) {
      setReadyToJoin(true);
    }
  };

  return {
    castVote,
    error,
  };
};
