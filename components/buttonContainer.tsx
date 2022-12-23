import { ReactNode } from "react";

interface ButtonContainer {
    children: ReactNode;
}

const ButtonContainer = ({ children }: ButtonContainer) => {
    return (
        <div className="my-6 flex gap-x-4">
            {children}
        </div>
    )
}

export default ButtonContainer;
