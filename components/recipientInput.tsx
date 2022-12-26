import { ethers } from "ethers";
import { useEffect, useState } from 'react';

const INFURA_ID = "a71874bbcb6a450398f24a7bbd436eda";
export const MAINNET_PROVIDER = new ethers.providers.InfuraProvider("homestead", INFURA_ID);

const RecipientInput = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [validAddress, setValidAddress] = useState<boolean | undefined>();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // only validate address after user has stopped typing for 1s
      if (recipientAddress) {
        const isAddress = ethers.utils.isAddress(recipientAddress);
        if (isAddress) {
          setValidAddress(true);
        } else {
          const resolved = await MAINNET_PROVIDER.resolveName(recipientAddress);
          if (resolved) {
            //setResolvedAddress(resolved);
            setValidAddress(true);
          } else {
            setValidAddress(false);
          }
        }
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [recipientAddress])

  return (
    <div className="w-80 flex flex-col">
      <label className="block text-sm font-medium text-gray-300 mt-3">Ethereum Address or ENS</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          name="ethaddress"
          id="ethaddress"
          className={`bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${validAddress === undefined ? "border-gray-500" : validAddress ? "border-green-400 text-green-500" : "border-pink-500 text-pink-600"}`}
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
      </div>
    </div>
  )
}

export default RecipientInput;
