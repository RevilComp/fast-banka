import { Link, useNavigate } from "react-router-dom";
import logo from "../../../logo.light.svg";
import Links from "./links/Links";
import Container from "../Container";
import Cookies from "js-cookie";
import { useEffect } from "react";

const Panel = ({ links }) => {
  
  return (
    <nav className="relative h-full">
      <Container>
        <Link to={"/"} className="block py-6 border-b border-gray-700 mb-12">
          <img src={logo} alt="Logo" className="w-26" />
        </Link>
        <ul className="pb-12">
          <Links links={links} />
        </ul>
      </Container>
    </nav>
  );
};

export default Panel;
