import { ReactNode } from "react";
import Spinner from "./spinner";

interface PrimaryButtonProps extends React.HTMLProps<HTMLButtonElement> {
    text: string;
    loading?: boolean;
}

const PrimaryButton = (props: PrimaryButtonProps) => {
    const { text, disabled, className, loading, ...rest } = props;
    if (disabled || loading) {
        return <button
            type="button"
            className={`flex-1 text-gray-800 bg-lime-200 cursor-not-allowed font-medium rounded-lg text-sm px-4 py-2.5 text-center ${className}`}
        >
            {text}
            {loading && <Spinner />}
        </button>
    }
    return (
        <button
            {...rest}
            type="button"
            className={`cursor-pointer flex-1 text-gray-800 bg-lime-300 hover:bg-lime-400 focus:ring-2 focus:ring-blue-100 font-medium rounded-lg text-sm px-4 py-2.5 text-center ${className}`}
        >{text}</button>
    )
}

export default PrimaryButton;
