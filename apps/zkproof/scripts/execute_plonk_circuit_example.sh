# Entering to the right folder
cd ..
cd plonk/example

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

# SETUP PHASE 2 - Plonk specific
# Prepare phase 2
snarkjs powersoftau prepare phase2 pot12_beacon.ptau pot12_final.ptau -v

# Plonk setup
snarkjs plonk setup example.r1cs pot12_final.ptau example_final.zkey

# Export the verification key
snarkjs zkey export verificationkey example_final.zkey verification_key.json

# Turn the verifier into a smart contract
snarkjs zkey export solidityverifier example_final.zkey ExampleVerifier.sol