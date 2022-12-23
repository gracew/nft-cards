import { ReactNode } from "react";

interface SecondaryButtonProps extends React.HTMLProps<HTMLButtonElement> {
    text: string | ReactNode;
}

const SecondaryButton = (props: SecondaryButtonProps) => {
    const { text, className, ...rest } = props;
    return (
        <button
            {...rest}
            type="button"
            className={`flex-1 px-5 py-2.5 text-sm font-medium text-gray-400 bg-gray-800 rounded-lg border border-gray-600 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-blue-100 ${className}`}
        >{text}</button>
    )
}

export default SecondaryButton;
