import { MenuIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useState } from "react";
import AuthButton from "./authButton";
import Menu from "./menu";
import PrimaryButton from "./primaryButton";

interface NavProps {
  hideGiveSnaps?: boolean;
}

const Nav = ({ hideGiveSnaps }: NavProps) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <nav className="mt-4 py-2.5">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <div className="cursor-pointer">
          <a onClick={() => setShowMenu(true)}>
            <MenuIcon className="h-8 w-8" />
          </a>
        </div>
        <div className="flex w-auto">
          <AuthButton />
        </div>
      </div>
      <Menu open={showMenu} onClose={() => setShowMenu(false)} />
    </nav>

  )
}

export default Nav;
