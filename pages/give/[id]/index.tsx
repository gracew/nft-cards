import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LargeSpinner from '../../../components/largeSpinner';
import SnapsRecipient from '../../../components/snapsRecipient';
import { definitions } from "../../../types/supabase";

const GiveToEdit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [snaps, setSnaps] = useState<definitions["snaps"]>();

  useEffect(() => {
    async function getExistingData() {
      await fetch('/api/getSnapsWithRecipient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id }),
      })
        .then(res => res.json())
        .then(setSnaps);
    };

    if (id) {
      getExistingData();
    }
  }, [id]);

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
    <SnapsRecipient existingData={snaps} />
  )
}

export default GiveToEdit;
