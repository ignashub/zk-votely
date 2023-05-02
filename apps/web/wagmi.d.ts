declare module 'wagmi' {
  import { ContractInterface, TransactionRequest, Signer } from 'ethers';

  export function useSigner(): {
    data: Signer | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  export function usePrepareContractWrite<T = any, K extends string = string>(
    config: PrepareWriteContractConfig<T, K>
  ): { data: PrepareWriteContractResult<T, K> | undefined };

  export interface PrepareWriteContractConfig<
    T = any,
    K extends string = string
  > {
    abi: ContractInterface;
    args?: T[];
    address: string;
    functionName: K;
  }

  export interface PrepareWriteContractResult<
    T = any,
    K extends string = string
  > {
    abi: ContractInterface;
    address: string;
    args?: T[];
    chainId?: number;
    functionName: K;
    mode: string;
    overrides?: TransactionRequest;
    request: TransactionRequest;
  }
}
