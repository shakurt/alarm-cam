import { NavLink, useNavigate } from "react-router";

import Button from "@/components/UI/Button";
import { useUser } from "@/context/userContext";

const Header = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useUser();

  return (
    <header className="bg-card py-3">
      <div className="container flex max-w-5xl items-center justify-between px-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer outline-none hover:outline-none focus:outline-none"
        >
          <h1 className="text-xl font-bold">Camera Alarm</h1>
        </button>

        <nav>
          <ul className="flex items-center gap-4">
            <li>
              <NavLink to="/about" className={"font-medium"}>
                About
              </NavLink>
            </li>
            {userInfo && (
              <li>
                <Button
                  type="button"
                  className="bg-secondary/40 hover:bg-secondary/35 px-5 py-[6px]"
                  onClick={logout}
                >
                  Logout
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
