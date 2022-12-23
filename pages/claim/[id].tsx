import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import Card from '../../components/card';
import LargeSpinner from '../../components/largeSpinner';
import MintPanel from '../../components/mintPanel';
import MintPanelContents from '../../components/mintPanelContents';
import PrimaryButton from '../../components/primaryButton';
import Share from '../../components/share';
import { shortenAddress } from '../../components/shortenedAddress';
import { supabase } from '../api/supabase';
import { UserContext } from '../_app';

const SnapsDetails: NextPage = (props: any) => {
  const router = useRouter();
  const { id } = router.query;
  const [snaps, setSnaps] = useState<any>(props.snaps);
  const [showPanel, setShowPanel] = useState(false);
  const [me, setMe] = useContext(UserContext);
  const [minting, setMinting] = useState(false);
  const [matchingEmail, setMatchingEmail] = useState(false);

  useEffect(() => {
    if (id) {
      fetch('/api/matchesRecipientEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id }),
      })
        .then(res => res.json())
        .then(setMatchingEmail);
    }
  }, [id]);

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
      .then(setSnaps)
      .finally(() => {
        setMinting(false);
        setShowPanel(false);
      });
  }

  function getInnerComponent() {
    return (
      <MintPanelContents
        text="This won't cost you any transaction fees."
      >
        <PrimaryButton text="Claim as NFT" onClick={mintNFT} loading={minting} />
      </MintPanelContents>
    );
  }

  function getOpenSeaUrl() {
    return process.env.NEXT_PUBLIC_NETWORK === "matic"
      ? `https://opensea.io/assets/matic/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${snaps.minted_token_id}`
      : `https://testnets.opensea.io/assets/mumbai/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${snaps.minted_token_id}`
  }

  function getTitle() {
    if (!snaps) {
      return "Snaps: Digital Collectible Shoutouts";
    }

    const sender = snaps.sender_fname || props.sender;
    const recipient = snaps.recipient_fname || props.recipient;

    return `Snaps: ${sender} sent ${recipient} a collectible shoutout`;
  }

  const inner = getInnerComponent();
  const isSender = me && me.sub.toLowerCase() === snaps.sender_id.toLowerCase();
  const claimable = !snaps.minted_at && !isSender && inner !== undefined;

  const shareText = `${snaps.sender_fname || props.sender} sent ${snaps.recipient_fname || props.recipient} a collectible shoutout with @givesnaps 🥰`;
  return (
    <div className="w-80 flex flex-col">
      <Head>
        <title>{getTitle()}</title>
        <meta name="description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
        <meta key="image" property="og:image" content={props.category.image_url} />

        <meta name="twitter:title" content={getTitle()} />
        <meta name="twitter:description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={props.category.image_url} />
      </Head>

      {!snaps && <>
        <div className="flex flex-col min-h-screen items-center justify-center">
          <LargeSpinner />
        </div>
      </>}
      {snaps && <>
        <div className="mt-5 mb-3 flex justify-between">
          {/* TODO: look up ENS */}
          <h2>From:
            <div>
              {snaps.sender_fname || props.sender}
            </div>
          </h2>
          <h2 className="text-right">To:
            <div>
              {snaps.recipient_fname || props.recipient}
            </div>
          </h2>
        </div>

        <Card
          onClick={() => { }}
          imageUrl={props.category.image_url}
          videoUrl={props.category.video_url}
          label={props.category!.label}
          description={snaps.note!}
          isSafari={props.isSafari}
        />

        {claimable
          ?
          <>
            <PrimaryButton
              className="mt-3"
              onClick={() => setShowPanel(true)}
              text="Claim"
            />
            <Share shareText={shareText} />
          </>
          :
          snaps.minted_at ?
            <>

              <PrimaryButton
                className="mt-3"
                onClick={() => window.open(getOpenSeaUrl(), '_blank')}
                target="_blank"
                text="View on OpenSea"
              />
              <Share shareText={shareText} />
            </>
            :
            <Share shareText={shareText} />
        }

        <MintPanel
          snaps={snaps}
          open={showPanel}
          onClose={() => setShowPanel(false)}
        >
          {inner}
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

export default SnapsDetails;
