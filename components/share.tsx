import { useRouter } from "next/router";
import { useState } from "react";

const Share = ({ shareText }: { shareText: string }) => {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const host = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

    async function copy() {
        await navigator.clipboard.writeText(`${host}${router.asPath}`);
        setCopied(true);
    }

    function twitterLink() {
        const withLink = `${shareText} ${host}${router.asPath}`;
        return `https://twitter.com/intent/tweet?text=${withLink}`;
    }

    function facebookLink() {
        return `https://facebook.com/sharer.php?u=${host}${router.asPath}`;
    }

    const twitterIcon = <svg width="24" height="21" viewBox="0 0 28 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.1219 5.73201C25.1397 5.98356 25.1397 6.23517 25.1397 6.48672C25.1397 14.1593 19.3656 23 8.81221 23C5.56092 23 2.54063 22.0476 0 20.3946C0.461947 20.4484 0.906066 20.4664 1.38579 20.4664C4.06849 20.4664 6.53808 19.55 8.51017 17.9867C5.98732 17.9328 3.87309 16.2617 3.14465 13.9617C3.50001 14.0156 3.85532 14.0515 4.22845 14.0515C4.74367 14.0515 5.25893 13.9796 5.7386 13.8539C3.10916 13.3148 1.13701 10.9789 1.13701 8.1578V8.08595C1.90094 8.51721 2.78935 8.78673 3.73091 8.82263C2.18521 7.78042 1.17256 6.00154 1.17256 3.98902C1.17256 2.91092 1.45677 1.92264 1.95427 1.06013C4.77916 4.582 9.02539 6.88196 13.7868 7.13357C13.698 6.70232 13.6446 6.25314 13.6446 5.80391C13.6446 2.60544 16.203 0 19.3832 0C21.0355 0 22.5279 0.700779 23.5761 1.83281C24.8731 1.58126 26.1167 1.09608 27.2183 0.431253C26.7918 1.77894 25.8858 2.91097 24.6954 3.62967C25.8503 3.50395 26.9696 3.18044 28 2.73127C27.2184 3.88122 26.2412 4.9054 25.1219 5.73201Z" fill="white" />
    </svg>;

    const facebookIcon = <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24">
        <path fill="#fff" d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
    </svg>

    const copyIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>;

    return (
        <div className="mt-4 flex justify-center gap-3">
            <button
                onClick={() => window.open(twitterLink(), "_blank")}
                className="p-3 text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white"
            >
                {twitterIcon}
            </button>

            <button
                onClick={() => window.open(facebookLink(), "_blank")}
                className="p-3 text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white"
            >
                {facebookIcon}
            </button>
            <button
                onClick={copy}
                className="p-3 text-sm text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white"
            >
                {copied ? "Copied!" : copyIcon}
            </button>
        </div>
    )
}

export default Share;
