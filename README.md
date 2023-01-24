# About

This is a Proof of Concept project which uses Zero-Knowledge Proofs to verify whenever a person voted yes or no without revealing it. The project also consists of simple arithmetic [circuit](https://docs.circom.io/getting-started/writing-circuits/) example. It also involves scripts for managing [Trusted setup](https://blog.pantherprotocol.io/a-guide-to-understanding-trusted-setups/) phase faster.

# Zero-Knowledge Proofs template

ZK-Proofs template is an extension of [WEB3 Template](https://github.com/Byont-Ventures/web3-template) which is a boilerplate for developing Dapps. This project is using 2 libraries for its ZK-Proofs:

- [Circom](https://github.com/iden3/circom) - compiler to write circuits (problem statements).
- [SnarkJS](https://github.com/iden3/snarkjs) - JavaScript implementation of zkSNARK schemes.

## Getting Started

Before getting started, we suggest reading our [Contributing Guidelines](/CONTRIBUTING.md).

### Prerequisites

Besides, installing tooling from [WEB3 Template](https://github.com/Byont-Ventures/web3-template). You'll need the following compiler:

- [Circom](https://github.com/iden3/circom)

You need several dependencies in your system to run [circom](https://github.com/iden3/circom) and its associated tools:

### Installing Circom

If you want follow official [Circom](https://docs.circom.io/getting-started/installation/#installing-circom) installation, follow [this](https://docs.circom.io/getting-started/installation/#installing-circom).

Make a new directory anywhere in your system.

Then install from sources, clone the [circom](https://github.com/iden3/circom) repository:

```
git clone https://github.com/iden3/circom.git
```

Enter the [circom](https://github.com/iden3/circom) directory and use the cargo build to compile:

```
cargo build --release
```

The installation takes around 3 minutes to be completed. When the command successfully finishes, it generates the [circom](https://github.com/iden3/circom) binary in the directory target/release. You can install this binary as follows:

```
cargo install --path circom
```

## Installing Application

```
$ yarn install
```

After this, all dependencies should be installed but just incase you can also install [snarkJS](https://github.com/iden3/snarkjs) library:

### Installing Snarkjs

[SnarkJS](https://github.com/iden3/snarkjs) is a npm package that contains code to generate and validate ZK proofs from the artifacts produced by circom.

You can install [snarkJS](https://github.com/iden3/snarkjs) with the following command:

```
npm install -g snarkjs
```

### Running Scripts

Before running the application it is needed to run [snarkJS](https://github.com/iden3/snarkjs) scripts. These scripts were made to speed up process of generating [circom](https://github.com/iden3/circom) circuits and doing [Trusted setup](https://blog.hermez.io/hermez-zero-knowledge-proofs/) phase.
To know how each circuit is generated, you can see the execute files inside the scripts folder.

To run the scripts go inside the scripts folder:

```
$ cd apps/zkproof/scripts
```

Run this command per script:

```
chmod u+x execute_groth16_circuit_example.sh

chmod u+x execute_plonk_circuit_example.sh

chmod u+x execute_vote_no_circuit.sh

chmod u+x execute_vote_yes_circuit.sh
```

And after that, you can always run this per script:

```
./execute_groth16_circuit_example.sh

./execute_plonk_circuit_example.sh

./execute_vote_no_circuit.sh

./execute_vote_yes_circuit.sh
```

## Starting the project

To start the project you need to start back-end which serves files needed for generating proofs:

```
$ cd apps/zkproof/file-server

$ node index.js
```

Then you can start the front-end:

```
$ yarn dev
```

## Circuit Explanation

Several diagrams were drawn to understand and have a better view of how the implemented circuits work.
To get more information on how to write Circom circuits check [this](https://docs.circom.io/).

Let's start with a simple prover and verifier workflow:

![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/prover_verifier_workflow.png?raw=true)

After that, let's look into our simple example circuit:

![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/arithmetic_circuit_example.png?raw=true)

This circuit is very simple and it is easy to reverse engineer the private signal. Nonetheless, it was made for
learning cases:

- Prover enters private signal B.
- Public signals are already given. (In this case you enter them through front-end, but it could be hard-coded).
- Intermediary signal D is calculated.
- Signal D is summed up with signal C to get OUT signal which has to be 18.

And here is the representation of it in Circom language:

```javascript
pragma circom 2.0.0;

/*This circuit template checks that c is the multiplication of a and b.*/

template Example () {
   // Declaration of signals.
   signal input a; //Public value.
   signal input b; //Private value.
   signal input c; //Public value.
   signal d; //Intermediate signal.
   signal output out; //Output of the signal.

   // The logic or a ‘constraint’ which a private signal has to satisfy.
   d <== a * b;
   out <== c + d;
   out === 18;
}

component main { public [ a, c ] } = Example();
```

So, in short what this circuit does - it takes 2 public and 1 private signal. Then it does the constraints and sees
if it is equal to 18.

What Prover and Verifier sees can be visualized through these diagrams:

![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/prover_verifier_views.png?raw=true)

- Prover knows everything about the circuit. All public, private signals, constraints, output.
- Verifier knows all the public signals, constraints, and the output value.

To continue, let's look into our Yes and No vote circuits. The idea behind these circuits is to identify whenever a
user voted Yes or No.

Yes vote circuit:

```javascript
pragma circom 2.0.0;

template YesBinaryCount () {
    signal input vote; // Users vote in binary
    signal output out; // Output of the circuit
    var number=0; // Counter

    // Counting how many bits does a String has
    for (var i = 0; i < vote; i++) {
        number+=1;
    }
    out <-- number; // Assigning counter to output
    out === 21; // Constraint: Yes string should have length of 21 bits
}

component main = YesBinaryCount();
```

No vote circuit:

```javascript
pragma circom 2.0.0;

template NoBinaryCount () {
    signal input vote; // Users vote in binary
    signal output out; // Output of the circuit
    var number=0; // Counter

    // Counting how many bits does a String has
    for (var i = 0; i < vote; i++) {
        number+=1;
    }
    out <-- number; // Assigning counter to output
    out === 14; // Constraint: No string should have length of 14 bits
}

component main = NoBinaryCount();
```

These circuits work very simple. They just take the binary length of Yes (101100111001011110011) or No (10011101101111) string and calculate whenever the length is correct to the circuits output 21 or 14.

To carry on, here is the representation of circuits in diagrams:

![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/yes_no_circuit_diagrams.png?raw=true)

And the Prover/Verifier views:

![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/prover_verifier_yes_vote_views.png?raw=true)
![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/prover_verifier_no_vote_views.png?raw=true)

## Circom and Snarkjs workflow

Finally, we should look into how Circom and SnarkJS work together.

To do so, a diagram was drawn:

![alt text](https://github.com/ignashub/web3-template/blob/main/apps/zkproof/diagrams/circom_snarkjs_flow.png?raw=true)

This particular example uses yes_vote_check circuit. But for explanation reasons we will just call it circuit because this logic is applicable for any circuit.

Starting from the top, Circom circuit is compiled into 2 files:

This process is done through the scripts.

- circuit.wasm/circuit.cpp - it is a program representation of your circuit. It takes the inputs(public and private signals) and then generates - witness which is a whole computational trace of your arithmetic circuit (all correct signals to satisfy your circuit).
- circuit.r1cs - more mathematical representation of a circuit. To read more about R1CS [start](https://medium.com/@VitalikButerin/quadratic-arithmetic-programs-from-zero-to-hero-f6d558cea649) here.

Starting from the left, witness is generated when the inputs (public and private signals) are supplied (e.g through the front-end) to circuit.wasm/cpp program.

On the right side, circuit.final.zkey is generated from the circuit. This file is a public parameters of the zk-SNARK protocol for our application.

- Then a verification key is generated from circuit.final.zkey. Verification key helps to identify our zk-SNARK protocol.
- Prover uses circuit.final.zkey as his proving key.
- Prover combines circuit.final.zkey with the witness file mentioned before. It generates the proof.json (actual proof).
- Prover sends the proof and public signals(inputs) to Verifier.
- Verifier uses either the verification key or Verifier smart contract (in our case) to verify the proof and public signals(inputs).
