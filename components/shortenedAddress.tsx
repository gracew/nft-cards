import { useEffect, useState } from "react";
import { MAINNET_PROVIDER } from "../auth";

export async function shortenAddress(address: string) {
    const resolved = await MAINNET_PROVIDER.lookupAddress(address)
    return resolved || `${address.substring(0, 5)}...${address.substring(address.length - 3)}`;
}

const ShortenedAddress = ({ address }: { address: string }) => {
    const shortened = `${address.substring(0, 5)}...${address.substring(address.length - 3)}`;
    const [text, setText] = useState(shortened);

    useEffect(() => {
        MAINNET_PROVIDER.lookupAddress(address)
            .then(resolved => {
                if (resolved) {
                    setText(resolved);
                }
            })

    }, [address]);

    return <>{text}</>
}

export default ShortenedAddress;
