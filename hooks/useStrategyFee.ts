import { useContract, useProvider } from "wagmi";
import { useSdk } from "../context/sdkProvider";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import IExecutionStrategyAbi from "@gulabs/gu-nft-marketplace-sdk/dist/abis/IExecutionStrategy.json"

export default function (strategy?: string) {
  const sdk = useSdk()
  const provider = useProvider()
  
  const [fee, setFee] = useState(0)

  useEffect(() => {
    const getFee = async () => {
      if (strategy) {
        const Strategy = new ethers.Contract(strategy, IExecutionStrategyAbi, provider)
        const fee = await Strategy.viewProtocolFee()
        
        setFee(fee.toNumber())
      }
    } 
    getFee()
  }, [sdk, provider])

  return fee
}
