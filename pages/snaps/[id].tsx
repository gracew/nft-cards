import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthType, connect, walletLogin } from '../../auth';
import { resolveCategory } from '../../category';
import Card from '../../components/card';
import GoogleButton from '../../components/googleButton';
import LargeSpinner from '../../components/largeSpinner';
import MintPanel from '../../components/mintPanel';
import MintPanelContents from '../../components/mintPanelContents';
import Nav from '../../components/nav';
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

  async function getMe() {
    return fetch('/api/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(setMe);
  };


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

  async function onClickConnect() {
    const res = await connect();
    await walletLogin(res);
    getMe();
    // TODO: handle failure case
  }

  function getInnerComponent() {
    const connectWallet = (
      <MintPanelContents
        text="If you own the address that this collectible was sent to, connect your wallet to claim."
      >
        <PrimaryButton text="Connect Wallet" onClick={onClickConnect} />
      </MintPanelContents>
    );
    const connectEmail = (
      <MintPanelContents
        text="If you own the email address that this collectible was sent to, log in with Google to claim."
      >
        <GoogleButton />
      </MintPanelContents>
    );
    const mint = (
      <MintPanelContents
        text="This won't cost you any transaction fees."
      >
        <PrimaryButton text="Claim as NFT" onClick={mintNFT} loading={minting} />
      </MintPanelContents>
    );

    if (snaps!.recipient_type === AuthType.ADDRESS) {
      if (!me || !me.address) {
        return connectWallet;
      } else {
        if (me.address.toLowerCase() === snaps!.recipient_wallet_address?.toLowerCase()) {
          return mint;
        }
        // else user address doesn't match the recipient address
      }
    } else {
      // recipient_type is email
      if (!me || !me.email) {
        return connectEmail;
      } else {
        if (matchingEmail) {
          if (me.address) {
            return mint;
          } else {
            return (
              <div className="flex flex-col pb-3">
                <div className="mb-4">
                  Congrats, this collectible is now available in <span className="text-lime-200 hover:text-lime-300">
                    <Link href="/snaps">your dashboard</Link></span>! If you want
                  to turn this collectible into an NFT, you&apos;ll need to connect a crypto wallet. If you don&apos;t
                  have one yet, check out <a
                    href="https://medium.com/@helena.gagern/how-to-mint-your-first-nft-for-free-6a252bb59824"
                    className="text-lime-200 hover:text-lime-300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    our guide
                  </a> for setting one up.
                </div>
                <PrimaryButton text="Connect Wallet" onClick={onClickConnect} />
              </div>
            )
          }
        }
        // else user email doesn't match the recipient email
      }
    }
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

  function getVideoTag() {
    if (props.category?.video_url) {
      return (
        <>
          <meta property="og:video" content={props.category.video_url} />
          <meta property="og:video:type" content="video" />
          <meta property="og:video:width" content="720" />
          <meta property="og:video:height" content="1280" />
        </>
      )
    }
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
        {getVideoTag()}

        <meta name="twitter:title" content={getTitle()} />
        <meta name="twitter:description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={props.category.image_url} />
      </Head>

      <Nav />
      {isSender && snaps.recipient_type === AuthType.ADDRESS && <div className='bg-gray-800 rounded-lg my-5 px-5 py-3'>
        We&apos;ve sent this shoutout to your friend&apos;s wallet address 🤩 Let them know by sharing the link below.
      </div>}
      {isSender && snaps.recipient_type === AuthType.EMAIL && <div className='bg-gray-800 rounded-lg my-5 px-5 py-3'>
        We&apos;ll email your friend and let them know of your appreciation 🙂
      </div>}

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

  props.category = await resolveCategory(snaps.category);

  const isSafari = /^((?!chrome|android).)*safari/i.test(context.req.headers['user-agent']!);
  props.isSafari = isSafari;
  return { props };
}

export default SnapsDetails;
