# About

This is a Proof of Concept v2 of Zero-Knowledge Voting system - ZK Votely. Check old-version branch for v1. This project uses Zero-Knowledge Proofs - [Semaphore protocol](https://semaphore.appliedzkp.org/).

# Proof of Concept

ZK Votely is an extension of [WEB3 Template](https://github.com/Byont-Ventures/web3-template) which is a boilerplate for developing Dapps. Stack Summary:

Front-end

- NextJS, Typescript, WAGMI, Rainbowkit, Semaphore Javascript Libraries

Back-end

- The Graph, Apollo client, Solidity, Semaphore Smart contracts.

## Getting Started

Before getting started, we suggest reading our [Contributing Guidelines](/CONTRIBUTING.md).

### Prerequisites

Besides, installing tooling from [WEB3 Template](https://github.com/Byont-Ventures/web3-template). It would be a good practice to get acquainted with the Zero-Knowledge Proofs and the research done:

- [DAO Analysis](/documentation/dao_analysis_v2.docx)

- [Zero-knowledge Proofs protocols and libraries](/documentation/zero_knowledge_proofs_protocols_and_libraries.docx)

- [Architecture Document](/documentation/design_document.docx)

- [Semaphore Protocol](/documentation/semaphore_protocol.docx)

- [Technical Document](/documentation/technical_document.docx)

Blog articles regards what is Zero-Knowledge proofs and how it work:

- [Zero Knowledge Proof - How it works and The Alibaba Cave Experiment](https://www.byont.io/blog/zero-knowledge-proof-how-it-works-and-the-alibaba-cave-experiment)

- [Zero-Knowledge Proof - Types, Protocols, and Implementations used in Blockchain](https://www.byont.io/blog/zero-knowledge-proof-types-protocols-and-implementations-used-in-blockchain)

- [Zero-Knowledge Proof - Cryptographic Primitives and Sigma Protocol](https://www.byont.io/blog/zero-knowledge-proof-cryptographic-primitives-and-sigma-protocol)

## Installing Application

```
$ yarn install
```

After this, all dependencies should be installed.

## Starting the project

```
$ yarn dev
```

# Proof of Concept - Flow

The proof of concept for bringing privacy to users' voting participation in DAOs using Semaphore protocol will consist of two components - a coordinator and a voter. The coordinator will have the ability:

- Create a ballot
- Start the ballot
- End the ballot.

On the other hand, the voter will be able to:

- Create an anonymous identity
- Join the ballot
- Cast their vote anonymously using the Semaphore protocol.

By having these features, users can ensure their privacy and vote without fear of repercussions or discrimination.

![alt text](documentation/flow_diagram.jpeg)
