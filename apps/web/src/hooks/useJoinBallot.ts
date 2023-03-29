import { useState } from 'react';
import { usePrepareContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';

// This hook returns joinBallot function which can be called to join a ballot,
// and loading and error state variables for the joinBallot function.
export const useJoinBallot = (pollId: string, identityCommitment: string) => {
  // State variables for loading and error
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState(null);

  // Get signer from Wagmi hook
  const { data: signer } = useSigner();

  // Prepare contract call configuration using Wagmi hook usePrepareContractWrite
  const { config, error } = usePrepareContractWrite({
    address: '0x84c403687c0811899A97d358FDd6Ce7012B1e6C0', // Smart contract address
    abi: SemaphoreVotingAbi, // Smart contract ABI
    functionName: 'addVoter', // Smart contract function name
    args: [pollId, identityCommitment], // Arguments for the smart contract function
  });

  // Join ballot function which will call smart contract function to add the voter
  const joinBallot = async () => {
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
      console.error('Error in joinBallot:', error);
      setLoading(false);
      // Set error state
      setHookError(error);
    }
  };

  // Return joinBallot function and loading and error state variables
  return {
    joinBallot,
    loading,
    error: hookError,
  };
};
