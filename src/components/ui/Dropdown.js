import { motion } from "framer-motion";

const Dropdown = ({ className, children }) => (
  <ul className={`dropdown relative ${className}`}>{children}</ul>
);

const DropdowMenu = ({ show, position, handleDropdown, children }) => {
  if (!show) return;

  document.body.addEventListener("click", (e) => {
    const dropdown = document.querySelector(".dropdown");

    if (!dropdown?.contains(e.target)) handleDropdown();
  });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Escape") handleDropdown();
  });

  return (
    <motion.ul
      className="dropdown-menu rounded bg-white shadow border px-4 py-6 absolute z-10"
      style={{
        transform: "translateX(-100%)",
        minWidth: window.innerWidth >= 1024 ? "300px" : "200px",
      }}
    >
      {children}
    </motion.ul>
  );
};

Dropdown.Menu = DropdowMenu;

export default Dropdown;
