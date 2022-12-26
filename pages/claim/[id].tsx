import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LargeSpinner from '../../components/largeSpinner';
import MintPanel from '../../components/mintPanel';
import MintPanelContents from '../../components/mintPanelContents';
import PrimaryButton from '../../components/primaryButton';
import { shortenAddress } from '../../components/shortenedAddress';
import { supabase } from '../api/supabase';

const ClaimCard: NextPage = (props: any) => {
  const router = useRouter();
  const { id } = router.query;
  const [card, setCard] = useState<any>();
  const [showPanel, setShowPanel] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    supabase
      .from("cards")
      .select("*")
      .eq('id', id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCard(data[0]);
        }
      })

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
        setShowPanel(false);
      });
  }

  function getOpenSeaUrl() {
    return process.env.NEXT_PUBLIC_NETWORK === "ethereum"
      ? `https://opensea.io/assets/ethereum/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${card.minted_token_id}`
      : `https://testnets.opensea.io/assets/goerli/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${card.minted_token_id}`
  }

  const claimable = !card.minted_at;

  return (
    <div className="w-80 flex flex-col">
      <Head>
        <title>A Holiday Card from Pearl</title>
        <meta name="description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
        <meta key="image" property="og:image" content={props.category.image_url} />

        <meta name="twitter:title" content="A Holiday Card from Pearl" />
        <meta name="twitter:description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={props.category.image_url} />
      </Head>

      {!card && <>
        <div className="flex flex-col min-h-screen items-center justify-center">
          <LargeSpinner />
        </div>
      </>}
      {card && <>
        <div className="mt-5 mb-3 flex justify-between">
          {/* TODO: look up ENS */}
          <h2>From: Grace & Helena at Pearl</h2>
          <h2 className="text-right">To:
            <div>
              {card.recipient_fname || props.recipient}
            </div>
          </h2>
        </div>

        <img src={props.category.image_url} alt="snaps image" />
        <div className="p-5">
          <p className="mb-2 font-normal">{card.note}</p>
        </div>

        {claimable
          ?
          <PrimaryButton
            className="mt-3"
            onClick={() => setShowPanel(true)}
            text="Claim"
          />
          :
          <PrimaryButton
            className="mt-3"
            onClick={() => window.open(getOpenSeaUrl(), '_blank')}
            target="_blank"
            text="View on OpenSea"
          />
        }

        <MintPanel
          snaps={card}
          open={showPanel}
          onClose={() => setShowPanel(false)}
        >
          <MintPanelContents
            text="This won't cost you any transaction fees."
          >
            <PrimaryButton text="Claim as NFT" onClick={mintNFT} loading={minting} />
          </MintPanelContents>
        </MintPanel>
      </>}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { data, error } = await supabase
    .rpc('get_snaps_with_sender', { snaps_id: context.query.id });
  const props: Record<string, any> = {};
  if (error || !data || data.length === 0) {
    return { props };
  }

  const snaps = data[0];
  props.snaps = snaps;
  if (snaps.sender_wallet_address) {
    props.sender = (await shortenAddress(snaps.sender_wallet_address));
  }

  if (snaps.recipient_wallet_address) {
    props.recipient = (await shortenAddress(snaps.recipient_wallet_address));
  }

  const isSafari = /^((?!chrome|android).)*safari/i.test(context.req.headers['user-agent']!);
  props.isSafari = isSafari;
  return { props };
}

export default ClaimCard;
