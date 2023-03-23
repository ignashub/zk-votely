import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';

export const useJoinBallot = (pollId: string, identityCommitment: string) => {
  const { config, error } = usePrepareContractWrite({
    address: '0x84c403687c0811899A97d358FDd6Ce7012B1e6C0',
    abi: SemaphoreVotingAbi,
    functionName: 'addVoter',
    args: [pollId, identityCommitment],
  });

  const contractWriteObject = useContractWrite(config);
  console.log('useJoinBallot:', contractWriteObject);
  const { write } = contractWriteObject;

  const joinBallot = () => {
    write();
  };

  return {
    joinBallot,
  };
};
