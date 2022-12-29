import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LargeSpinner from '../../components/largeSpinner';
import PrimaryButton from '../../components/primaryButton';
import RecipientInput from '../../components/recipientInput';

const Claim: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [card, setCard] = useState<any>();
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    fetch('/api/cards/' + id)
      .then(res => res.json())
      .then(setCard);
  });

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
      .then(setCard)
      .finally(() => {
        setMinting(false);
      });
  }

  function getOpenSeaUrl() {
    return process.env.NEXT_PUBLIC_NETWORK === "ethereum"
      ? `https://opensea.io/assets/ethereum/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${card.minted_token_id}`
      : `https://testnets.opensea.io/assets/goerli/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${card.minted_token_id}`
  }

  return (
    <div className="w-80 flex flex-col">
      {!card && <>
        <div className="flex flex-col min-h-screen items-center justify-center">
          <LargeSpinner />
        </div>
      </>}
      {card && <>
        {/*<img src={props.category.image_url} alt="card image" />*/}
        <div className="p-5">
          <p className="mb-2 font-normal">{card.note}</p>
        </div>

        {!card.minted_at
          ?
          <>
          <RecipientInput />
            <PrimaryButton
              className="mt-3"
              onClick={mintNFT}
              text="Claim"
              loading={minting}
            />
          </>
          :
          <PrimaryButton
            className="mt-3"
            onClick={() => window.open(getOpenSeaUrl(), '_blank')}
            target="_blank"
            text="View on OpenSea"
          />
        }

        This won't cost you any transaction fees.
      </>}
    </div>
  )
}

export default Claim;
