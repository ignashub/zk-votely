import { usePrepareContractWrite } from 'wagmi';
import { useState } from 'react';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';

export const useCreateBallot = (
  pollId: string,
  coordinator: string | undefined,
  merkleTreeDepth: BigNumber | undefined,
  title: string | undefined,
  description: string | undefined,
  votingOptions: string[]
) => {
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState(null);
  const { data: signer } = useSigner();

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
    gasLimit: BigNumber.from(5000000),
  });

  const createBallot = async () => {
    if (
      !pollId ||
      !coordinator || // change this line
      !merkleTreeDepth ||
      !title ||
      !description ||
      votingOptions.length === 0
    ) {
      console.error('Some input data is missing');
      return;
    }
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
