import { ethers } from "ethers";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AuthType, MAINNET_PROVIDER } from '../auth';
import ButtonContainer from './buttonContainer';
import Nav from './nav';
import Or from './or';
import PrimaryButton from './primaryButton';
import SecondaryButton from './secondaryButton';

interface SnapsRecipientProps {
  existingData?: any;
}

// https://stackoverflow.com/a/46181
function validateEmail(email: string) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const SnapsRecipient = ({ existingData }: SnapsRecipientProps) => {
  const router = useRouter();
  const [recipientType, setRecipientType] = useState<AuthType | undefined>(existingData?.recipient_type as AuthType);
  const [recipientName, setRecipientName] = useState<string>(existingData?.recipient_fname || "");
  const [recipientEmail, setRecipientEmail] = useState<string>(existingData?.recipient_email || "");
  const [recipientAddress, setRecipientAddress] = useState<string>(existingData?.recipient_wallet_address || "");
  const [validEmail, setValidEmail] = useState<boolean | undefined>();
  const [validAddress, setValidAddress] = useState<boolean | undefined>();
  const [resolvedAddress, setResolvedAddress] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // only validate email after user has stopped typing for 1s
      if (recipientEmail) {
        setValidEmail(validateEmail(recipientEmail) !== null);
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [recipientEmail])

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
            setResolvedAddress(resolved);
            setValidAddress(true);
          } else {
            setValidAddress(false);
          }
        }
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [recipientAddress])

  function disabled() {
    if (recipientType === AuthType.EMAIL) {
      return !recipientName || !validEmail;
    } else if (recipientType === AuthType.ADDRESS) {
      return !validAddress;
    }
    return false;
  }

  async function createSnaps() {
    const data = recipientType === AuthType.EMAIL
      ? { recipientName, recipientEmail }
      : { recipientAddress: resolvedAddress || recipientAddress };
    const snaps = await fetch('/api/createSnaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientType,
        ...data,
      }),
    }).then(res => res.json());
    return snaps.id;
  }

  async function updateSnaps() {
    const data = recipientType === AuthType.EMAIL
      ? { recipientName, recipientEmail }
      : { recipientAddress: resolvedAddress || recipientAddress };
    await fetch('/api/updateSnaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: existingData!.id,
        recipientType,
        ...data,
      }),
    }).then(res => res.json());
    return existingData!.id;
  }

  async function onNext() {
    setLoading(true);
    const newId = await (existingData ? updateSnaps() : createSnaps());
    router.push(`/give/${newId}/category`);
  }


  return (
    <div className="w-80 flex flex-col">
      <Nav hideGiveSnaps={true} />
      <h1 className="text-2xl font-bold mt-5 mb-3">
        Give Snaps and Spread ❤️
      </h1>
      <h2 className="my-2">Send a shoutout to a friend in 3 simple steps. They&apos;ll be able to claim it for free.</h2>
      <h2 className="my-2">Who are you sending to?</h2>

      {!recipientType && <div className="flex flex-col">
        <PrimaryButton
          text="Email"
          onClick={() => setRecipientType(AuthType.EMAIL)}
        />
        <Or />
        <PrimaryButton
          text="Ethereum Address"
          onClick={() => setRecipientType(AuthType.ADDRESS)}
        />
      </div>}

      {recipientType === "email" && <div>
        <label className="block text-sm font-medium text-gray-300 mt-3">First Name</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            name="fname"
            id="fname"
            className="bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-500 rounded-md "
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">This will be publicly visible.</p>

        <label className="block text-sm font-medium text-gray-300 mt-3">Email</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="email"
            name="email"
            id="email"
            className={`bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${validEmail === undefined || validEmail ? "border-gray-500" : "border-pink-500 text-pink-600"}`}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">This is private and will only be used to notify your friend.</p>
      </div>}

      {recipientType === "address" &&
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

        </div>}
      {recipientType && <ButtonContainer>
        <SecondaryButton
          text="Back"
          onClick={() => setRecipientType(undefined)}
        />
        <PrimaryButton
          text="Next"
          onClick={onNext}
          disabled={disabled()}
          loading={loading}
        />
      </ButtonContainer>}

    </div>
  )
}

export default SnapsRecipient;
