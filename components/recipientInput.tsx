import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import PrimaryButton from "./primaryButton";

const INFURA_ID = "a71874bbcb6a450398f24a7bbd436eda";
export const MAINNET_PROVIDER = new ethers.providers.InfuraProvider("homestead", INFURA_ID);

const RecipientInput = ({ id }: { id: string }) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [validAddress, setValidAddress] = useState<boolean | undefined>();
  const [minting, setMinting] = useState(false);

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

  async function mintNFT() {
    setMinting(true);
    fetch('/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      //.then(setCard)
      .finally(() => {
        setMinting(false);
      });
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-400 mt-6">To claim this card as an NFT, enter your Ethereum address or ENS. This won't cost you any transaction fees.</label>
      <div className="my-3 relative rounded-md shadow-sm">
        <input
          type="text"
          name="ethaddress"
          id="ethaddress"
          placeholder="yourname.eth"
          className={`my-3 bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${validAddress === undefined ? "border-gray-500" : validAddress ? "border-green-400 text-green-500" : "border-pink-500 text-pink-600"}`}
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
      </div>
      <PrimaryButton
        className="w-full"
        onClick={mintNFT}
        text="Claim"
        loading={minting}
        disabled={!validAddress}
      />
    </div>
  )
}

export default RecipientInput;
