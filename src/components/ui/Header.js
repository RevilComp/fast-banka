import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCircle } from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo.dark.svg";
import userIcon from "../../user.png";
import Button from "./Button";
import Dropdown from "./Dropdown";
import { useState } from "react";
import * as RemoteController from "../../remoteControl";
import Cookies from "js-cookie";
import Container from "./Container";

const Header = ({ handleSidebar, className }) => {
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

  const getProfileInformation = localStorage.getItem("profile");

  const logOut = () => {
    Cookies.remove("token");
    localStorage.clear();
    navigate("/login");
  };

  const handleDropdown = () => setDropdown(!dropdown);
  const user = JSON.parse(localStorage.getItem("profile"))
  const remoteUser = JSON.parse(localStorage.getItem("remoteProfile"))
  return (
    <header
      className={`bg-white sticky top-0 shadow-sm py-4 lg:py-8 z-10 ${className}`}
    >
      <Container className={"flex items-center gap-4"}>
        <FontAwesomeIcon
          icon={faBars}
          size="lg"
          className="lg:hidden text-dark cursor-pointer"
          onClick={handleSidebar}
        />
        <Link to={"/"} className="block lg:hidden w-20">
          <img src={logo} alt="Logo" />
        </Link>
        <Dropdown className={"ms-auto"}>
          <img
            src={userIcon}
            alt="User"
            className="w-8 cursor-pointer"
            onClick={handleDropdown}
          />
          <Dropdown.Menu show={dropdown} handleDropdown={handleDropdown}>
            <li className="flex items-center text-sm gap-2">
              <FontAwesomeIcon
                icon={faCircle}
                size="sm"
                className="text-success"
              />
              <span className="font-bold">
                {RemoteController.isControlling() ? (
                  remoteUser ? remoteUser.firstName : (user ? user.firstName : '')
                ) : (
                  <></>
                )}
              </span>

            </li>
            <hr className="my-4" />
            {RemoteController.isControlling() ? (
              <li>
                <Button
                  type={"button"}
                  className={"flex items-center w-full"}
                  onClick={() =>
                    RemoteController.logOutRemote(
                      getProfileInformation.type === "super_admin"
                    )
                  }
                >
                  <span className="text-danger">Çıkış</span>
                </Button>
              </li>
            ) : (
              <li>
                <Button
                  type={"button"}
                  className={"flex items-center w-full"}
                  onClick={() => logOut()}
                >
                  <span className="text-danger ms-1">Çıkış</span>
                </Button>
              </li>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </header>
  );
};

export default Header;
