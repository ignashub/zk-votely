import snarkjs = require('snarkjs');

export const makeProof = async (_proofInput, _wasm, _zkey) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    _proofInput,
    _wasm,
    _zkey
  );
  return { proof, publicSignals };
};

export const verifyProof = async (_verificationkey, signals, proof) => {
  const vkey = await fetch(_verificationkey).then(function (res) {
    return res.json();
  });

  const res = await snarkjs.groth16.verify(vkey, signals, proof);
  return res;
};

export const makePlonkProof = async (_proofInput, _wasm, _zkey) => {
  const { proof, publicSignals } = await snarkjs.plonk.fullProve(
    _proofInput,
    _wasm,
    _zkey
  );
  return { proof, publicSignals };
};

export const verifyPlonkProof = async (_verificationkey, signals, proof) => {
  const vkey = await fetch(_verificationkey).then(function (res) {
    return res.json();
  });

  const res = await snarkjs.plonk.verify(vkey, signals, proof);
  return res;
};
