import { Link } from "react-router-dom";
import Offcanvas from "./Offcanvas";
import logo from "../../logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Links from "./panel/links/Links";

const Sidebar = ({ show, handleSidebar, links }) => (
  <Offcanvas show={show} className={"!bg-secondary !z-50"}>
    <Offcanvas.Header className={"bg-secondary"}>
      <Link to={"/"} onClick={handleSidebar}>
        <img src={logo} alt="Logo" className="w-24" />
      </Link>
      <FontAwesomeIcon
        icon={faTimes}
        size="xl"
        className="text-white ms-auto"
        onClick={handleSidebar}
      />
    </Offcanvas.Header>
    <Offcanvas.Body>
      <ul className="pb-12">
        <Links links={links} onClick={handleSidebar} />
      </ul>
    </Offcanvas.Body>
    <Offcanvas.Footer>
      <p className="text-white text-sm">
        © {new Date().getFullYear()} havaleode, all rights reserved.
      </p>
    </Offcanvas.Footer>
  </Offcanvas>
);

export default Sidebar;
