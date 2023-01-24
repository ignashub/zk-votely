# Entering to the right folder
cd ..
cd groth16/example

# Compile the example
circom example.circom --r1cs --wasm --sym

# Start a new powers of tau ceremony
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Contribute to the ceremony
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# Provide a second contribution
snarkjs powersoftau contribute pot12_0001.ptau pot12_0002.ptau --name="Second contribution" -v -e="some random text"

# Provide a third contribution using third party software
snarkjs powersoftau export challenge pot12_0002.ptau challenge_0003
snarkjs powersoftau challenge contribute bn128 challenge_0003 response_0003 -e="some random text"
snarkjs powersoftau import response pot12_0002.ptau response_0003 pot12_0003.ptau -n="Third contribution name"

# Apply a random beacon
# We need to apply a random beacon in order to finalise phase 1 of the trusted setup
snarkjs powersoftau beacon pot12_0003.ptau pot12_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"

# SETUP PHASE 2 - Groth16 specific
# Prepare phase 2
snarkjs powersoftau prepare phase2 pot12_beacon.ptau pot12_final.ptau -v

# This generates the reference zkey without phase 2 contributions
# IMPORTANT: Do not use this zkey in production, as it's not safe. It requires at least a contribution
snarkjs groth16 setup example.r1cs pot12_final.ptau example_0000.zkey

# Contribute to the phase 2 ceremony
snarkjs zkey contribute example_0000.zkey example_0001.zkey --name="1st Contributor Name" -v

# Provide a second contribution
snarkjs zkey contribute example_0001.zkey example_0002.zkey --name="Second contribution Name" -v -e="Another random entropy"

# Provide a third contribution using third party software
snarkjs zkey export bellman example_0002.zkey  challenge_phase2_0003
snarkjs zkey bellman contribute bn128 challenge_phase2_0003 response_phase2_0003 -e="some random text"
snarkjs zkey import bellman example_0002.zkey response_phase2_0003 example_0003.zkey -n="Third contribution name"

# Apply a random beacon
snarkjs zkey beacon example_0003.zkey example_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

# Export the verification key
snarkjs zkey export verificationkey example_final.zkey verification_key.json

# Turn the verifier into a smart contract
snarkjs zkey export solidityverifier example_final.zkey ExampleVerifier.sol