import { motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const Offcanvas = ({ show, handleOffcanvas, className, children }) => {
  useEffect(() => {
    const body = document.querySelector("body");

    if (show) body.style.overflow = "hidden";
    else body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [show]);

  //   document.body.addEventListener("click", (e) => {
  //     if (e.target === document.getElementById("offcanvas-overlay"))
  //       handleOffcanvas();
  //   });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Escape" && handleOffcanvas) handleOffcanvas();
  });

  return createPortal(
    <motion.div
      className={`offcanvas fixed top-0 bg-white flex flex-col w-full overflow-y-scroll h-screen z-10 ${className}`}
      animate={{ translateX: show ? "0%" : "-100%" }}
      //   animate={{ translateX: "0%" }}
      transition={{ ease: "easeOut", duration: 0.15 }}
    >
      {children}
    </motion.div>,
    document.getElementById("offcanvas-backdrop")
  );
};

const OffcanvasHeader = ({ children, className }) => (
  <div className={`offcanvas-header flex sticky top-0 py-6 px-6 ${className}`}>
    {children}
  </div>
);

const OffcanvasBody = ({ children }) => (
  <div className="offcanvas-body my-8 px-6">{children}</div>
);

const OffcanvasFooter = ({ children }) => (
  <div className="offcanvas-footer mt-auto px-6 py-6">{children}</div>
);

Offcanvas.Header = OffcanvasHeader;
Offcanvas.Body = OffcanvasBody;
Offcanvas.Footer = OffcanvasFooter;

export default Offcanvas;
