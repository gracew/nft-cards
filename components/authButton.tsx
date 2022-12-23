import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import { Fragment, useContext } from 'react'
import GoogleLogin from 'react-google-login'
import { connect, getWeb3Modal, walletLogin } from '../auth'
import { UserContext } from '../pages/_app'
import { onGoogleFailure, onGoogleSuccess } from './googleButton'
import ShortenedAddress from './shortenedAddress'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const AuthButton = () => {
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

    async function logout() {
        await fetch('/api/logout');
        if (me.address) {
            const web3Modal = getWeb3Modal();
            web3Modal.clearCachedProvider();
        }
        setMe(undefined);
        if (router.asPath.startsWith("/snaps")) {
            router.push("/login");
        }
    }

    async function onClickConnect() {
        const res = await connect();
        const success = await walletLogin(res);
        if (success) {
            getMe();
        }
        // TODO: handle failure case
    }

    function googleMenuItem(text: string) {
        return <Menu.Item>
            {({ active }) => (
                <GoogleLogin
                    clientId="314131181818-4oos4568l2idp0t71u5lembd9qb55f9e.apps.googleusercontent.com"
                    onSuccess={(res) => {
                        onGoogleSuccess(res as any).then(getMe);
                    }}
                    onFailure={onGoogleFailure}
                    render={renderProps => (
                        <button
                            className='block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white'
                            onClick={renderProps.onClick}
                        >
                            {text}
                        </button>
                    )}
                />
            )}
        </Menu.Item>
    }

    function walletMenuItem(text: string) {
        return <Menu.Item>
            {({ active }) => (
                <button
                    className={classNames(
                        active ? 'bg-gray-700 text-white' : 'text-gray-300',
                        'block w-full text-left px-4 py-2 text-sm'
                    )}
                    onClick={onClickConnect}
                >
                    {text}
                </button>
            )}
        </Menu.Item>
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-full border border-gray-400 shadow-sm ml-2 px-4 py-2.5 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {me?.address ?
                        <ShortenedAddress address={me.address} />
                        :
                        me?.email ? <div className="w-20 truncate">{me.email}</div>
                            :
                            <div>Log In</div>}
                    <ChevronDownIcon className="-mr-1 h-5 w-5" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {/* Unauthenticated options */}
                        {(!me || !me.sub) && googleMenuItem("With Google")}
                        {(!me || !me.sub) && walletMenuItem("With Wallet")}

                        {/* Authenticated options */}
                        {me && me.sub && !me.email && googleMenuItem("Connect Email")}
                        {me && me.sub && !me.address && walletMenuItem("Connect Wallet")}
                        {me && me.sub && <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={classNames(
                                        active ? 'bg-gray-700 text-white' : 'text-gray-300',
                                        'block w-full text-left px-4 py-2 text-sm'
                                    )}
                                    onClick={logout}
                                >
                                    Log Out
                                </button>
                            )}
                        </Menu.Item>}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default AuthButton;
