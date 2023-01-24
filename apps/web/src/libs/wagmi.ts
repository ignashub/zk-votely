import { chain, configureChains, createClient } from 'wagmi';
// import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

export const defaultChains = [
  chain.mainnet,
  chain.polygonMumbai,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [chain.goerli] : []),
];

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: 'Zero-Knowledge Proofs Prototyping',
  chains,
});

export const client = createClient({
  autoConnect: false,
  connectors,
  provider,
  webSocketProvider,
});

export { defaultChains as chains };
