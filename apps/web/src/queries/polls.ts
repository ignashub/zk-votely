import { gql } from '@apollo/client';

export const GET_VOTE_COUNTS_BY_POLL_ID = gql`
  query GetVoteCountsByPollId($pollId: String!) {
    voteCounts(where: { poll: $pollId }) {
      option
      count
    }
  }
`;

export const POLLS_QUERY = gql`
  query GetAllPolls {
    polls {
      id
      title
      description
      merkleTreeDepth
      votingOptions {
        id
        value
        voteCounts {
          id
          count
        }
      }
    }
  }
`;

export const VOTE_COUNTS_QUERY = gql`
  query VoteCounts {
    voteCounts {
      id
      option
      count
      poll {
        id
        title
      }
    }
  }
`;
