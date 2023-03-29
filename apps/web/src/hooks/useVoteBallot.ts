import { useState } from 'react';
import { usePrepareContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';

export const useVoteBallot = (
  vote: string,
  nullifierHash: string,
  pollId: string,
  proofArray: BigNumber[],
  merkleTreeRoot: string
) => {
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState(null);
  const { data: signer } = useSigner();

  const { config, error } = usePrepareContractWrite({
    address: '0x84c403687c0811899A97d358FDd6Ce7012B1e6C0',
    abi: SemaphoreVotingAbi,
    functionName: 'castVote',
    args: [vote, nullifierHash, pollId, proofArray, merkleTreeRoot],
    gasLimit: BigNumber.from(5000000),
  });

  const voteBallot = async () => {
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
      console.error('Error in voteBallot:', error);
      setLoading(false);
      setHookError(error);
    }
  };

  return {
    voteBallot,
    loading,
    error: hookError,
  };
};
