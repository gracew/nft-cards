import { ethers } from "ethers";
import { useEffect, useState } from 'react';

const INFURA_ID = "a71874bbcb6a450398f24a7bbd436eda";
export const MAINNET_PROVIDER = new ethers.providers.InfuraProvider("homestead", INFURA_ID);

interface SnapsRecipientProps {
  existingData?: any;
}

const SnapsRecipient = ({ existingData }: SnapsRecipientProps) => {
  const [recipientAddress, setRecipientAddress] = useState<string>(existingData?.recipient_wallet_address || "");
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
      <h1 className="text-2xl font-bold mt-5 mb-3">
        Give Snaps and Spread ❤️
      </h1>
      <h2 className="my-2">Send a shoutout to a friend in 3 simple steps. They&apos;ll be able to claim it for free.</h2>
      <h2 className="my-2">Who are you sending to?</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mt-3">Ethereum Address or ENS</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="polygonaddress"
              id="polygonaddress"
              className={`bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${validAddress === undefined ? "border-gray-500" : validAddress ? "border-green-400 text-green-500" : "border-pink-500 text-pink-600"}`}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>

        </div>
    </div>
  )
}

export default SnapsRecipient;
