import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';

export const useJoinBallot = (pollId: string, identityCommitment: string) => {
  const { config, error } = usePrepareContractWrite({
    address: '0x4cfED314eadD3Dd6bAF7888BA289a2FE8F1A87fC',
    abi: SemaphoreVotingAbi,
    functionName: 'addVoter',
    args: [pollId.toString(), identityCommitment],
  });

  const { write } = useContractWrite(config);

  const joinBallot = () => {
    write();
  };

  return {
    joinBallot,
  };
};
