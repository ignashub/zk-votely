import { useState } from 'react';
import { usePrepareContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';

export const useStartBallot = (pollId, encryptionKey) => {
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState(null);
  const { data: signer } = useSigner();

  const { config } = usePrepareContractWrite({
    address: '0x4F3CB2EEBE4648d314F40d2Ec8BfE7243326a71E',
    abi: SemaphoreVotingAbi,
    functionName: 'startPoll',
    args: [pollId, encryptionKey],
    // gasLimit: BigNumber.from(5000000),
  });

  const startBallot = async () => {
    if (!signer || !config) {
      return null;
    }

    setLoading(true);
    setHookError(null);

    try {
      const contract = new ethers.Contract(config.address, config.abi, signer);
      const transaction = await contract[config.functionName](...config.args);
      await transaction.wait();
      setLoading(false);
    } catch (error) {
      console.error('Error in startBallot:', error);
      setLoading(false);
      setHookError(error);
    }
  };

  return {
    startBallot,
    loading,
    error: hookError,
  };
};
