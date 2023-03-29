import { useState } from 'react';
import { Identity } from '@semaphore-protocol/identity';

export const useIdentity = () => {
  const [identity, setIdentity] = useState<Identity>();

  const createIdentity = async () => {
    try {
      const _identity = new Identity();
      setIdentity(_identity);
    } catch (error) {
      console.error('Error creating identity:', error);
    }
  };

  return {
    identity,
    createIdentity,
  };
};
