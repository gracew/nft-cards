import Cookies from "js-cookie";
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ButtonContainer from '../../../components/buttonContainer';
import LargeSpinner from '../../../components/largeSpinner';
import MinimalCard from '../../../components/minimalCard';
import Nav from '../../../components/nav';
import PrimaryButton from '../../../components/primaryButton';
import SecondaryButton from '../../../components/secondaryButton';
import { definitions } from "../../../types/supabase";
import { supabase } from '../../api/supabase';

export interface Category {
  id: string;
  label: string;
  image_url: string;
  video_url?: string;
  description?: string;
}

function ipfsUrl(hash: string) {
  return `https://ipfs.infura.io/ipfs/${hash}`;
}

export const displayedTypes: Category[] = [
  {
    id: "earth_warrior",
    label: 'Earth Warrior',
    image_url: ipfsUrl("QmcywcHdfmGmy2gKuZ7EQrLqZQDpYSiB3pF51LLC5K1u71"),
    video_url: ipfsUrl("QmdZuC2hEbMknmCmiQyc7yE1vGcahMWcotZGzuv4BW4qev"),
  },
  {
    id: "iwd_powerful_voice",
    label: 'Powerful Voice',
    image_url: ipfsUrl("Qme8ArgCuwQiMeFDcrUeQ7MkkdNgNJKv4WiZ8iBFDGr9cs"),
    video_url: ipfsUrl("Qmcoxo138eFbqND3RJwM5suXzdDW4LZoJFHFkE8qLNikPp"),
  },
  {
    id: "iwd_motivation_muse",
    label: 'Motivation Muse',
    image_url: ipfsUrl("QmRVy9SotJktHdkQNJ4F6gi6TupDPb4S4FUSgdisgpYupi"),
    video_url: ipfsUrl("QmS1RWRc4iGSCDoYa17Z8EZvsG6W9EFFFCPkdpN5nkQxey"),
  },
  {
    id: "iwd_innovative_pioneer",
    label: 'Innovative Pioneer',
    image_url: ipfsUrl("QmfXdEfXxTZ6W9j9MQe2PvZXuqXWPDxSCEVyygRbGpXj2x"),
    video_url: ipfsUrl("QmZNdCozrcg4wLDXsFQEpdaa451SMiH4aoS39VFHosPK95"),
  },
  {
    id: "iwd_creative_genius",
    label: 'Creative Genius',
    image_url: ipfsUrl("QmNpM28ToNsGqfm2Ng9gQraYec49CrT8zVLkPuFvpxLzGC"),
    video_url: ipfsUrl("QmbYzSZCAHVZLzu99toMsVuoJmhwt67x7UD2LtFk8RrLXq"),
  },
  {
    id: "iwd_uplifting_soul",
    label: 'Uplifting Soul',
    image_url: ipfsUrl("QmYU2DhLLBxhK86HM7dcL5xwFRiE51w2w6ZQfYycXC5X4R"),
    video_url: ipfsUrl("QmYBZVHMkVH8ix3fWhdxSvG4Nyyh98iJR3FpPC6DdP18aA"),
  },
  {
    id: "iwd_fearless_activist",
    label: 'Fearless Activist',
    image_url: ipfsUrl("QmXvW2p28GqmqXWrnXZJfw9AQmaQkb39CvTNBNxB9zLnfQ"),
    video_url: ipfsUrl("QmeUQcfQP6ZiBKYr1z1DzAopKrQkZG4CAbg5SLio1rwd63"),
  },
]
export const spcTypes: Category[] = [
  {
    id: "spc_nurture",
    label: 'Nurture Yourself',
    description: "The best work is built on a foundation of self-care. Don't be afraid to get your needs met.",
    image_url: ipfsUrl("QmdfmoP1LWcGsuDxvJuD4aC18dhXGkrypDWjAGKD2xHDKb"),
  },
  {
    id: "spc_scale",
    label: 'Scale Your Mountain',
    description: "We explore with intention and ask hard questions of each other, to find work that matters to us.",
    image_url: ipfsUrl("QmZ7yBnzGL1zRKo7eo5VorbgshoCX9mn2SGyunZ4N2rssM"),
  },
  {
    id: "spc_dig",
    label: 'Dig Deep Wells',
    description: "By showing up authentically and investing in meaningful relationships, we forge bonds that will last beyond our time at SPC.",
    image_url: ipfsUrl("QmaQ2HMkqc3r9JJvjcmyx6zFiB7fxvfUXW8Wc1qN6qfX5X"),
  },
  {
    id: "spc_own",
    label: 'Own Your Better Future',
    description: "By immersing yourself and taking initiative, you leave a legacy for those who will walk in your steps. SPC is yours now: you don't need to ask for permission!",
    image_url: ipfsUrl("QmVk3JURy2ChnydXfQY7B5RhuYGHs6XjjTS3Vz8V59dKaE"),
  },
  {
    id: "spc_first_bug",
    label: 'Bug Basher',
    image_url: ipfsUrl("Qmc4PPDUNJNY7uiDyhbfM7tcaiDa4uGShE2L2hXBu9wY16"),
  },
  {
    id: "spc_fastest_referral",
    label: 'Fastest Referral',
    image_url: ipfsUrl("QmZsTCsG5UbSQjHyAiphyCrRBAb6Ysryop21k1MvJNg8m2"),
  },
]

const GiveCategory: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [category, setCategory] = useState<string>();
  const [snaps, setSnaps] = useState<definitions["snaps"]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getExistingData() {
      const { data, error } = await supabase
        .from<definitions["snaps"]>("snaps")
        .select("*")
        .eq("id", id as string);
      if (!error && data && data.length > 0) {
        setSnaps(data[0]);
        setCategory(data[0].category);
      }
    };

    getExistingData();
  }, [id]);

  async function onNext() {
    setLoading(true);
    supabase.auth.setAuth(Cookies.get("snToken")!);
    await supabase
      .from<definitions["snaps"]>("snaps")
      .update({ category })
      .eq('id', id as string);
    router.push(`/give/${id}/note`);
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

      <h2 className="my-2">What makes your friend special?</h2>

      <div className='py-3 grid grid-cols-2 gap-3'>
        {displayedTypes.map(t => <MinimalCard
          key={t.label}
          selected={category === t.id}
          hover={true}
          onClick={() => setCategory(t.id)}
          imageUrl={t.image_url}
          label={t.label}
        />)}
      </div>

      <ButtonContainer>
        <SecondaryButton
          text="Back"
          onClick={() => router.push(`/give/${id}`)}
        />
        <PrimaryButton
          text="Next"
          onClick={onNext}
          disabled={!category}
          loading={loading}
        />
      </ButtonContainer>
    </div>
  )
}

export default GiveCategory;
