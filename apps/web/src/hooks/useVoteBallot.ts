import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { BigNumber } from 'ethers';

export const useVoteBallot = (
  vote: string,
  nullifierHash: string,
  pollId: string,
  proofArray: BigNumber[],
  merkleTreeRoot: string
) => {
  const { config, error } = usePrepareContractWrite({
    address: '0x84c403687c0811899A97d358FDd6Ce7012B1e6C0',
    abi: SemaphoreVotingAbi,
    functionName: 'castVote',
    args: [vote, nullifierHash, pollId, proofArray, merkleTreeRoot],
    gasLimit: BigNumber.from(5000000),
  });

  // console.log('usePrepareContractWrite config:', config);
  // console.log('usePrepareContractWrite error:', error);

  const contractWriteObject = useContractWrite(config);
  console.log('useVoteBallot:', contractWriteObject);
  const { write } = contractWriteObject;

  const voteBallot = async () => {
    try {
      if (write) {
        const response = await write();
        console.log('Transaction response:', response);
      } else {
        console.error('Write function is not available');
      }
    } catch (err) {
      console.error('Error in voteBallot:', err);
    }
  };

  return {
    voteBallot,
  };
};
