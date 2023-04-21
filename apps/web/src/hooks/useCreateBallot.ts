import { usePrepareContractWrite } from 'wagmi';
import { useState } from 'react';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { useSigner } from 'wagmi';
import { ethers, BigNumber, ContractInterface } from 'ethers';
import { TransactionRequest } from '@ethersproject/abstract-provider';

interface ConfigType {
  abi: ContractInterface;
  address: string;
  args?: [BigNumber, `0x${string}`, BigNumber, string, string, string[]];
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

  // const abi = new Interface(SemaphoreVotingAbi);
  // const data = {
  //   data: abi.encodeFunctionData('createPoll', [
  //     BigNumber.from(pollId),
  //     coordinator,
  //     BigNumber.from(merkleTreeDepth),
  //     title,
  //     description,
  //     votingOptions,
  //   ]),
  // };

  const { data: resultConfig } = usePrepareContractWrite({
    address: '0x4F3CB2EEBE4648d314F40d2Ec8BfE7243326a71E',
    abi: SemaphoreVotingAbi,
    functionName: 'createPoll',
    args: [
      BigNumber.from(pollId),
      coordinator,
      BigNumber.from(merkleTreeDepth),
      title,
      description,
      votingOptions,
    ],
  });

  const config = resultConfig as ConfigType;

  const createBallot = async () => {
    if (
      !pollId ||
      !coordinator ||
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
      console.log('config:', config);
      const contract = new ethers.Contract(config.address, config.abi, signer);
      console.log('config.args:', config.args);
      const transaction = await contract[config.functionName](...config.args);
      await transaction.wait();
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
