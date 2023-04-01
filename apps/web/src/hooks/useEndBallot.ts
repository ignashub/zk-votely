import { useState } from 'react';
import { usePrepareContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';

export const useEndBallot = (pollId: string) => {
  // State variables for loading and error
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState(null);

  // Get signer from Wagmi hook
  const { data: signer } = useSigner();

  // Prepare contract call configuration using Wagmi hook usePrepareContractWrite
  const { config, error } = usePrepareContractWrite({
    address: '0x6A0cCb2be9edC44842142DA12a865477ea1103A5', // Smart contract address
    abi: SemaphoreVotingAbi, // Smart contract ABI
    functionName: 'endPoll', // Smart contract function name
    args: [pollId], // Arguments for the smart contract function
  });

  const endBallot = async () => {
    if (!signer || !config) {
      return null;
    }

    // Set loading to true and reset error
    setLoading(true);
    setHookError(null);

    try {
      // Create ethers.js contract instance
      const contract = new ethers.Contract(config.address, config.abi, signer);
      // Call smart contract function using the function name and arguments from the config object
      const transaction = await contract[config.functionName](...config.args);
      // Wait for the transaction to be confirmed on the blockchain
      await transaction.wait();
      // Set loading to false
      setLoading(false);
    } catch (error) {
      console.error('Error in endBallot:', error);
      setLoading(false);
      // Set error state
      setHookError(error);
    }
  };

  // Return endBallot function and loading and error state variables
  return {
    endBallot,
    loading,
    error: hookError,
  };
};
