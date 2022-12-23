import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { connect, walletLogin } from "../auth";
import GoogleButton from '../components/googleButton';
import Or from "../components/or";
import SecondaryButton from "../components/secondaryButton";
import { UserContext } from './_app';

const Login: NextPage = () => {
  const router = useRouter();
  const [me, setMe] = useContext(UserContext);

  function getMe() {
    return fetch('/api/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(setMe);
  }

  useEffect(() => {
    if (me?.address || me?.email) {
      router.push("/snaps")
    }
  }, [router]);

  async function onClickConnect() {
    const res = await connect();
    const success = await walletLogin(res);
    if (success) {
      getMe();
      router.push("/snaps")
    }
    // TODO: handle failure case
  }

  return (
    <div className="flex flex-col flex-1 justify-center">
      <div className="w-80 flex flex-col">
        <h1 className="text-2xl font-bold mt-5 mb-3">
          Log In
        </h1>
        <GoogleButton onSuccess={() => router.push("/snaps")} />
        <Or />
        <SecondaryButton
          text="Connect Wallet"
          onClick={onClickConnect}
        />
      </div>
    </div>
  )
}

export default Login;
