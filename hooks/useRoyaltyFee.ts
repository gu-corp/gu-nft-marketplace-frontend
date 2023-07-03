import { useProvider } from "wagmi";
import { useSdk } from "../context/SDKProvider";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import IRoyaltyFeeManagerAbi from "@gulabs/gu-nft-marketplace-sdk/dist/abis/IRoyaltyFeeManager.json"

export default function (collectionAddress: string, tokenId: string, amount = 1) {
  const sdk = useSdk()
  const provider = useProvider()
  
  const [fee, setFee] = useState(0)

  useEffect(() => {
    const getFee = async () => {
      if (!collectionAddress || !tokenId) return
      const royaltyFeeManager = new ethers.Contract(sdk.addresses.ROYALTY_FEE_MANAGER, IRoyaltyFeeManagerAbi, provider)
      const [, fee] = await royaltyFeeManager.calculateRoyaltyFeeAndGetRecipient(collectionAddress, tokenId, amount)
      setFee(fee.toNumber())
    } 
    getFee()
  }, [sdk, provider])

  return fee
}
