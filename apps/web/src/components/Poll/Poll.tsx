import { Box, Button } from '@chakra-ui/react';
import { useContract, useSigner, useContractEvent } from 'wagmi';
import { SemaphoreVotingAbi } from '../../abis/SemaphoreVoting';
import { Group } from '@semaphore-protocol/group';
import { AbiItem } from 'web3-utils';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'web3-utils';

interface PollProps {
  group: Group;
}

export const Poll: React.FC<PollProps> = ({ group }) => {
  //Smart Contract Signer
  const { data: signer, isError, isLoading } = useSigner();

  //SemaphoreVote Smart Contract
  const contract = useContract({
    address: '0x8095aECca42a881A268E4ad446bc977EF33FDF91',
    abi: SemaphoreVotingAbi,
    signerOrProvider: signer,
  });

  const getPollResults = async (
    pollId: number
  ): Promise<Map<number, number>> => {
    const treeDepth = 32; // Replace with the correct depth of your Merkle tree
    const root = group.root;
    const numLeaves = 2 ** treeDepth;
    const votes: number[] = [];
    for (let i = 0; i < numLeaves; i++) {
      const vote = await contract.getVote(pollId, i);
      votes.push(parseInt(vote));
    }
    const leaves = votes.map((v) => keccak256(v));
    const tree = new MerkleTree(leaves, keccak256, { hashLeaves: true });
    const results = new Map<number, number>();
    for (let i = 0; i < numLeaves; i++) {
      const vote = parseInt(votes[i]);
      const leaf = leaves[i];
      const proof = tree.getProof(leaf).map((p) => p.toString('hex'));
      const leafHash = keccak256(vote);
      const isValid = tree.verify(proof, leaf, root, leafHash);
      if (isValid) {
        if (results.has(vote)) {
          results.set(vote, results.get(vote)! + 1);
        } else {
          results.set(vote, 1);
        }
      }
    }
  };

  // const getPollResults = async () => {
  //   console.log(group.root);
  // };

  return (
    <Box
      as="footer"
      role="contentinfo"
      mx="auto"
      maxW="7xl"
      py="12"
      px={{ base: '4', md: '8' }}
    >
      Poll
      <Button
        variant="solid"
        bg="black"
        _hover={{ bg: 'gray.600' }}
        color="white"
        onClick={getPollResults}
        mr={[0, '4']}
        mb={['4', 0]}
        w={['full', 'auto']}
      >
        get merkle tree
      </Button>
    </Box>
  );
};
