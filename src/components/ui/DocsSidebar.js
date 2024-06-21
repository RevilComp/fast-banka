import Offcanvas from "./Offcanvas";
import logo from "../../logo.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const DocsSidebar = ({ show, handleSidebar }) => (
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
      <ul>
        <li className="mb-4">
          <a
            className="text-gray-400 hover:text-white text-sm font-bold"
            href="#credits"
            onClick={handleSidebar}
          >
            Credits
          </a>
        </li>
        <li className="mb-4">
          <a
            className="text-gray-400 hover:text-white text-sm font-bold"
            href="#parameter-credits"
            onClick={handleSidebar}
          >
            Parameters and Descriptons
          </a>
        </li>
        <li className="mb-4">
          <a
            className="text-gray-400 hover:text-white text-sm font-bold"
            href="#callback-mechanism"
            onClick={handleSidebar}
          >
            Callback Mechanism
          </a>
        </li>
        <li className="mb-4">
          <a
            className="text-gray-400 hover:text-white text-sm font-bold"
            href="#transaction-by-transactionUid"
            onClick={handleSidebar}
          >
            Get Transaction by transactionUid
          </a>
        </li>
        <li className="mb-4">
          <a
            className="text-gray-400 hover:text-white text-sm font-bold"
            href="#bank-withdraw"
            onClick={handleSidebar}
          >
            Bank Withdraw
          </a>
        </li>
        <li className="mb-4">
          <a
            className="text-gray-400 hover:text-white text-sm font-bold"
            href="#bank-deposit"
            onClick={handleSidebar}
          >
            Bank Deposit
          </a>
        </li>
      </ul>
    </Offcanvas.Body>
    <Offcanvas.Footer>
      <p className="text-white text-sm">
        © {new Date().getFullYear()} havaleode, all rights reserved.
      </p>
    </Offcanvas.Footer>
  </Offcanvas>
);

export default DocsSidebar;
