import { faAngleDown, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Collapse from "../../collapse/Collapse";
import { Link, useLocation, useNavigate } from "react-router-dom";

const LinkItem = ({ link, onClick }) => {
  const navigate = useNavigate();
  const [collapse, setCollapse] = useState(true);

  const handleCollapse = () => setCollapse(!collapse);

  const pathname = useLocation().pathname;

  return (
    <li className="font-semibold text-sm mb-4 select-none" key={link.to}>
      <section
        className={`grid grid-cols-12 items-center text-gray-400 hover:text-white ${
          link?.children && collapse && "text-white"
        } cursor-pointer mb-1`}
        onClick={() => {
          if (link?.to) navigate(link.to);

          handleCollapse();
        }}
      >
        <div className="col-span-1">{link?.icon}</div>
        <div className="col-span-10">
          <span className="ms-2">{link?.parent}</span>
        </div>
        <div className="col-span-1">
          {link.children && (
            <FontAwesomeIcon icon={faAngleDown} className="ms-auto" />
          )}
        </div>
      </section>
      {link.children && (
        <Collapse show={collapse}>
          {link.children.map((child) => (
            <Collapse.Item className={"py-2"}>
              <Link
                to={child.to}
                className={`grid grid-cols-12 items-center gap-1.5 ${
                  pathname === child.to ? "text-white" : "text-gray-400"
                } hover:text-white`}
                onClick={onClick}
              >
                <div className="col-span-1"></div>
                <div className="col-span-10 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCircle} size="xs" className="w-1" />
                  <span>{child.text}</span>
                </div>
              </Link>
            </Collapse.Item>
          ))}
        </Collapse>
      )}
    </li>
  );
};

export default LinkItem;
