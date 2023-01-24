import type { NextPage } from 'next';
import { Section } from '@/components/Section';
import {
  Text,
  Box,
  Heading,
  Button,
  Input,
  Flex,
  RadioGroup,
  Radio,
  Stack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { VoteYesVerifierAbi } from '../abis/VoteYesVerifier';
import { VoteNoVerifierAbi } from '../abis/VoteNoVerifier';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import snarkjs = require('snarkjs');

const makeProof = async (_proofInput, _wasm, _zkey) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    _proofInput,
    _wasm,
    _zkey
  );
  return { proof, publicSignals };
};

const verifyProof = async (_verificationkey, signals, proof) => {
  const vkey = await fetch(_verificationkey).then(function (res) {
    return res.json();
  });

  const res = await snarkjs.groth16.verify(vkey, signals, proof);
  return res;
};

const makePlonkProof = async (_proofInput, _wasm, _zkey) => {
  const { proof, publicSignals } = await snarkjs.plonk.fullProve(
    _proofInput,
    _wasm,
    _zkey
  );
  return { proof, publicSignals };
};

const verifyPlonkProof = async (_verificationkey, signals, proof) => {
  const vkey = await fetch(_verificationkey).then(function (res) {
    return res.json();
  });

  const res = await snarkjs.plonk.verify(vkey, signals, proof);
  return res;
};

const Home: NextPage = () => {
  //Example with groth16
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [proof, setProof] = useState('');
  const [signals, setSignals] = useState('');
  const [isValid, setIsValid] = useState(false);

  const wasmFile =
    'http://localhost:8000/groth16/example/example_js/example.wasm';
  const zkeyFile = 'http://localhost:8000/groth16/example/example_final.zkey';
  const verificationKey =
    'http://localhost:8000/groth16/example/verification_key.json';

  const runProofs = () => {
    const proofInput = { a, b, c };
    console.log(proofInput);

    makeProof(proofInput, wasmFile, zkeyFile).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setProof(JSON.stringify(_proof, null, 2));
        setSignals(JSON.stringify(_signals, null, 2));
        verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
          setIsValid(_isValid);
        });
      }
    );
  };

  //Example with plonk
  const wasmFilePlonk =
    'http://localhost:8000/plonk/example/example_js/example.wasm';
  const zkeyFilePlonk =
    'http://localhost:8000/plonk/example/example_final.zkey';
  const verificationKeyPlonk =
    'http://localhost:8000/plonk/example/verification_key.json';

  const runPlonkProofs = () => {
    const proofInput = { a, b, c };
    console.log(proofInput);

    makePlonkProof(proofInput, wasmFilePlonk, zkeyFilePlonk).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setProof(JSON.stringify(_proof, null, 2));
        setSignals(JSON.stringify(_signals, null, 2));
        verifyPlonkProof(verificationKeyPlonk, _signals, _proof).then(
          (_isValid) => {
            setIsValid(_isValid);
          }
        );
      }
    );
  };

  //Vote verification via PLONK
  const [voteString, setVoteString] = useState('');
  const [voteProof, setVoteProof] = useState('');
  const [voteSignals, setVoteSignals] = useState('');
  const [isVoteValid, setIsVoteValid] = useState(false);
  const [voteProofSC1, setVoteProofSC1] = useState<`0x${string}` | undefined>();
  const [voteProofSC2, setVoteProofSC2] = useState<BigNumber | undefined>('');

  const wasmFileVoteYes =
    'http://localhost:8000/plonk/votecheck/yes_vote_check/yes_vote_check_js/yes_vote_check.wasm';
  const zkeyFileVoteYes =
    'http://localhost:8000/plonk/votecheck/yes_vote_check/yes_vote_check_final.zkey';
  const verificationKeyVoteYes =
    'http://localhost:8000/plonk/votecheck/yes_vote_check/verification_key.json';

  const wasmFileVoteNo =
    'http://localhost:8000/plonk/votecheck/no_vote_check/no_vote_check_js/no_vote_check.wasm';
  const zkeyFileVoteNo =
    'http://localhost:8000/plonk/votecheck/no_vote_check/no_vote_check_final.zkey';
  const verificationKeyVoteNo =
    'http://localhost:8000/plonk/votecheck/no_vote_check/verification_key.json';

  const { config: yesVoteConfig } = usePrepareContractWrite({
    address: '0xf88081640879E12586fA484791203a64e22Aea06',
    abi: VoteYesVerifierAbi,
    functionName: 'verifyYesProof',
    args: [voteProofSC1, voteProofSC2],
  });

  const { write: voteYesWrite } = useContractWrite(yesVoteConfig);

  const { config: noVoteConfig } = usePrepareContractWrite({
    address: '0x197FF0b2aaa050E20Bfc148b6DF97f726DfcEF2c',
    abi: VoteNoVerifierAbi,
    functionName: 'verifyNoProof',
    args: [voteProofSC1, voteProofSC2],
  });

  const { write: voteNoWrite } = useContractWrite(noVoteConfig);

  const voteToBinary = (str = '') => {
    let res = '';
    res = str
      .split('')
      .map((char) => {
        return char.charCodeAt(0).toString(2);
      })
      .join('');
    return res;
  };

  const makeVoteCallData = async (_proofInput, _wasm, _zkey) => {
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      _proofInput,
      _wasm,
      _zkey
    );
    const callData = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );
    console.log(callData.split(',')[0]);
    console.log(JSON.parse(callData.slice(callData.indexOf(',') + 1)));
    setVoteProofSC1(callData.split(',')[0]);
    setVoteProofSC2(JSON.parse(callData.slice(callData.indexOf(',') + 1)));
  };

  const runVoteYesProofs = () => {
    const vote = voteToBinary(voteString).length;
    console.log(voteToBinary(voteString));
    const proofInput = { vote };
    console.log(proofInput);

    makePlonkProof(proofInput, wasmFileVoteYes, zkeyFileVoteYes).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setVoteProof(JSON.stringify(_proof, null, 2));
        setVoteSignals(JSON.stringify(_signals, null, 2));
        verifyPlonkProof(verificationKeyVoteYes, _signals, _proof).then(
          (_isValid) => {
            setIsVoteValid(_isValid);
          }
        );
        makeVoteCallData(proofInput, wasmFileVoteYes, zkeyFileVoteYes);
      }
    );
  };

  const runVoteNoProofs = () => {
    const vote = voteToBinary(voteString).length;
    console.log(voteToBinary(voteString));
    const proofInput = { vote };
    console.log(proofInput);

    makePlonkProof(proofInput, wasmFileVoteNo, zkeyFileVoteNo).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setVoteProof(JSON.stringify(_proof, null, 2));
        setVoteSignals(JSON.stringify(_signals, null, 2));
        verifyPlonkProof(verificationKeyVoteNo, _signals, _proof).then(
          (_isValid) => {
            setIsVoteValid(_isValid);
          }
        );
        makeVoteCallData(proofInput, wasmFileVoteNo, zkeyFileVoteNo);
      }
    );
  };

  return (
    <>
      <main
        data-testid="Layout"
        id="maincontent"
        className={
          'relative flex flex-col flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16'
        }
      >
        <Section>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <Flex justifyContent="center" flexDirection="column">
              <ConnectButton />
              <Heading size={'xl'} marginBottom="20px">
                Verify with Groth16
              </Heading>
              <Input
                id="outlined-basic"
                placeholder="A = 4"
                type="number"
                label="a"
                onChange={(e) => setA(e.target.value)}
                errorBorderColor="red.300"
                w="140px"
                style={{ marginBottom: '8px' }}
              />
              <Input
                id="outlined-basic"
                placeholder="B = 3"
                type="number"
                label="b"
                onChange={(e) => setB(e.target.value)}
                errorBorderColor="red.300"
                w="140px"
                style={{ marginBottom: '8px' }}
              />
              <Input
                id="outlined-basic"
                placeholder="C = 6"
                type="number"
                label="c"
                onChange={(e) => setC(e.target.value)}
                errorBorderColor="red.300"
                w="140px"
                style={{ marginBottom: '8px' }}
              />

              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={runProofs}
                marginBottom="16px"
              >
                Verify Proof With Groth16
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={runPlonkProofs}
                marginBottom="16px"
              >
                Verify Proof With Plonk
              </Button>
              <Heading size={'xl'} marginBottom="20px">
                Proof:
              </Heading>
              <Text marginBottom="16px">{proof}</Text>
              <Heading size={'md'} marginBottom="16px">
                Signals:
              </Heading>
              <Text marginBottom="40px">{signals}</Text>
              <Heading size={'md'} marginBottom="16px">
                Valid:
              </Heading>
              {proof.length > 0 && (
                <Text>{isValid ? 'Valid proof' : 'Invalid proof'}</Text>
              )}

              <Heading size={'xl'} marginTop="50px" marginBottom="20px">
                Verify Vote via Smart Contract
              </Heading>
              <RadioGroup
                onChange={setVoteString}
                value={voteString}
                marginBottom="16px"
              >
                <Stack direction="row">
                  <Radio colorScheme="green" value="Yes">
                    Yes
                  </Radio>
                  <Radio colorScheme="red" value="No">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>

              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={runVoteYesProofs}
                marginBottom="16px"
              >
                Verify Yes Proof
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={voteYesWrite}
                marginBottom="16px"
              >
                Verify Yes Proof With Smart Contract
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={runVoteNoProofs}
                marginBottom="16px"
              >
                Verify No Proof
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={voteNoWrite}
                marginBottom="16px"
              >
                Verify No Proof With Smart Contract
              </Button>
              <Heading size={'md'} marginBottom="16px">
                Proof:
              </Heading>
              <Text marginBottom="16px">{voteProof}</Text>
              <Heading size={'md'} marginBottom="16px">
                Signals:
              </Heading>
              <Text marginBottom="40px">{voteSignals}</Text>
              <Heading size={'md'} marginBottom="16px">
                Valid:
              </Heading>
              {voteProof.length > 0 && (
                <Text>{isVoteValid ? 'Valid proof' : 'Invalid proof'}</Text>
              )}
            </Flex>
          </Box>
        </Section>
      </main>
      <footer>
        <Text>Byont Ventures B.V. © {new Date().getFullYear()}</Text>
      </footer>
    </>
  );
};

export default Home;
