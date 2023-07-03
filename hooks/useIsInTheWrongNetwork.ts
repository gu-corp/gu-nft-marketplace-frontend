import { useNetwork, useSigner } from "wagmi"

export default () => {
  const { chains, chain: activeChain } = useNetwork()
  const { data: signer } = useSigner()
  return Boolean(signer && chains.findIndex(chain => chain.id === activeChain?.id ) === -1)
}