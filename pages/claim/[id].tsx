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

  useEffect(() => {
    if (id) {
      fetch('/api/cards/' + id)
        .then(res => res.json())
        .then(setCard);
    }
  }, [id]);

  function getOpenSeaUrl() {
    return process.env.NEXT_PUBLIC_NETWORK === "ethereum"
      ? `https://opensea.io/assets/ethereum/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${card.minted_token_id}`
      : `https://testnets.opensea.io/assets/goerli/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${card.minted_token_id}`
  }

  return (
    <div className="w-96 flex flex-col">
      <div className="flex flex-col min-h-screen items-center justify-center">
        {!card && <LargeSpinner />}
        {card && <>
          <img src="/card.png" alt="Happy Holidays from Pearl" className="my-5" />
          <p className="mb-2 font-normal">{card.note}</p>

          {!card.minted_at
            ?
            <RecipientInput id={id as string} />
            :
            <PrimaryButton
              className="mt-3"
              onClick={() => window.open(getOpenSeaUrl(), '_blank')}
              target="_blank"
              text="View on OpenSea"
            />
          }

        </>}
      </div>
    </div>
  )
}

export default Claim;
