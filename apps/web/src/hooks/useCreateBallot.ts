import { usePrepareContractWrite } from 'wagmi';
import { useState } from 'react';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';

export const useCreateBallot = (
  pollId: string,
  coordinator: string,
  merkleTreeDepth: number,
  title: string,
  description: string,
  votingOptions: string[]
) => {
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState(null);
  const signer = useSigner(); // move this outside of createBallot

  const { config, error } = usePrepareContractWrite({
    address: '0x6A0cCb2be9edC44842142DA12a865477ea1103A5',
    abi: SemaphoreVotingAbi,
    functionName: 'createPoll',
    args: [
      pollId,
      coordinator,
      merkleTreeDepth,
      title,
      description,
      votingOptions,
    ],
  });

  const createBallot = async () => {
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
      console.error('Error in createBallot:', error);
      setLoading(false);
      setHookError(error);
    }
  };

  return {
    createBallot,
    loading,
    error: hookError,
  };
};
