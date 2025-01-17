import { usePrepareContractWrite, useSigner } from 'wagmi';
import { useState } from 'react';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { ethers, BigNumber, ContractInterface } from 'ethers';
import { TransactionRequest } from '@ethersproject/abstract-provider';

type ArgsType = [BigNumber, `0x${string}`, BigNumber, string, string, string[]];

interface ConfigType {
  abi: ContractInterface;
  address: string;
  args: ArgsType;
  functionName: string;
  mode: string;
  overrides?: TransactionRequest;
  request: TransactionRequest;
  chainId?: number;
}

export const useCreateBallot = (
  pollId: string,
  coordinator: `0x${string}`,
  merkleTreeDepth: BigNumber | undefined,
  title: string,
  description: string,
  votingOptions: string[]
) => {
  const [loading, setLoading] = useState(false);
  const [hookError, setHookError] = useState<Error | null>(null);
  const { data: signer } = useSigner();

  const { config } = usePrepareContractWrite({
    address: '0x4F3CB2EEBE4648d314F40d2Ec8BfE7243326a71E', // Smart contract address
    abi: SemaphoreVotingAbi, // Smart contract ABI
    functionName: 'createPoll', // Smart contract function name
    args: [
      BigNumber.from(pollId),
      coordinator,
      BigNumber.from(merkleTreeDepth),
      title,
      description,
      votingOptions,
    ],
  });
  // console.log('resultConfig:', resultConfig); // Add this log

  // const config = resultConfig as ConfigType;

  const createBallot = async () => {
    console.log('Inside createBallot function'); // Add this log

    setLoading(true);
    setHookError(null);

    try {
      console.log('config:', config);
      const contract = new ethers.Contract(config.address, config.abi, signer);
      console.log('contract:', contract); // Log the contract object
      console.log('config.args:', config.args);
      const transaction = await contract[config.functionName](...config.args);
      console.log('transaction:', transaction); // Log the transaction object
      await transaction.wait();
      console.log('Transaction completed'); // Log a message after the transaction is awaited
      setLoading(false);
    } catch (error) {
      const typedError = error as Error | null;
      console.error('Error in createBallot:', typedError);
      setLoading(false);
      setHookError(typedError);
    }
  };

  return {
    createBallot,
    loading,
    error: hookError,
  };
};
