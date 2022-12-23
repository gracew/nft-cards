import { useContext } from "react";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import { UserContext } from "../pages/_app";
import SecondaryButton from "./secondaryButton";

interface GoogleButtonProps {
  onSuccess?: () => void;
}

export async function onGoogleSuccess(res: GoogleLoginResponse) {
  await fetch('/api/login/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tokenId: res.tokenId }),
  });
}

export function onGoogleFailure(res: any) {
  console.log("failure", res);
}

const GoogleButton = ({ onSuccess }: GoogleButtonProps) => {
  const [me, setMe] = useContext(UserContext);

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

  return (
    <GoogleLogin
      clientId="314131181818-4oos4568l2idp0t71u5lembd9qb55f9e.apps.googleusercontent.com"
      onSuccess={(res) => {
        onGoogleSuccess(res as any)
          .then(getMe)
          .then(() => {
            if (onSuccess) {
              onSuccess();
            }
          })
      }}
      onFailure={onGoogleFailure}
      render={renderProps => (
        <SecondaryButton
          text="Log In with Google"
          onClick={renderProps.onClick}
        />
      )}
    />
  )
}

export default GoogleButton;
