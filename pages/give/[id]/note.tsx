import Cookies from 'js-cookie';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ButtonContainer from '../../../components/buttonContainer';
import LargeSpinner from '../../../components/largeSpinner';
import Nav from '../../../components/nav';
import PrimaryButton from '../../../components/primaryButton';
import SecondaryButton from '../../../components/secondaryButton';
import ShortenedAddress from '../../../components/shortenedAddress';
import { definitions } from "../../../types/supabase";
import { supabase } from '../../api/supabase';

const GiveNote: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [snaps, setSnaps] = useState<definitions["snaps"]>();
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getExistingData() {
      const { data, error } = await supabase
        .from<definitions["snaps"]>("snaps")
        .select("*")
        .eq("id", id as string);
      if (!error && data && data.length > 0) {
        setSnaps(data[0]);
      }
    };

    getExistingData();
  }, [id]);

  async function onFinish() {
    setLoading(true);
    await fetch('/api/completeSnaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, note }),
    })
    router.push(`/snaps/${id}`);
  }

  if (!snaps) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <LargeSpinner />
      </div>
    );
  }

  if (snaps.note) {
    // the snaps is already complete
    router.push(`/snaps/${id}`);
    return <></>
  }

  return (
    <div className="w-80 flex flex-col">
      <Nav hideGiveSnaps={true} />
      <h1 className="text-2xl font-bold mt-5 mb-3">
        Give Snaps
      </h1>
      {/* TODO: look up ENS */}
      <h2 className="my-2">Personalize this shoutout! Write a note of appreciation for {snaps?.recipient_fname || <ShortenedAddress address={snaps?.recipient_wallet_address!} />}.</h2>

      <div className="mt-1 relative rounded-md shadow-sm">
        <textarea
          name="note"
          id="note"
          className="bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-500 rounded-md"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">This will be publicly visible.</p>

      <ButtonContainer>
        <SecondaryButton
          text="Back"
          onClick={() => router.push(`/give/${id}/category`)}
        />
        <PrimaryButton
          text="Finish"
          onClick={onFinish}
          disabled={!note}
          loading={loading}
        />
      </ButtonContainer>
    </div>
  )
}

export default GiveNote;
