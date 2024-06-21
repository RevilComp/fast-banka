import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ show, handleModal, className, children }) => {
  useEffect(() => {
    const body = document.querySelector("body");

    if (show) body.style.overflow = "hidden";
    else body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  if (!show) return;

  const classes = `modal flex flex-col w-full bg-white rounded p-8 shadow border border-gray-300 ${className}`;

  document.body.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-overlay")) handleModal();
  });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Escape") handleModal();
  });

  return createPortal(
    <div id="modal-overlay" className="z-50">
      <motion.div
        animate={{ scale: [1.15, 1], opacity: [0.75, 1] }}
        transition={{ ease: "easeOut", duration: 0.15 }}
        className={classes}
      >
        {children}
      </motion.div>
    </div>,
    document.getElementById("modal-backdrop")
  );
};

const ModalHeader = ({ className, handleModal, children }) => {
  const classes = `modal-header relative sticky top-0 flex items-center ${className}`;

  return (
    <div className={classes}>
      {children}
      <FontAwesomeIcon
        icon={faTimes}
        size="lg"
        className="text-gray-500 hover:text-dark cursor-pointer absolute top-1/2 -translate-y-1/2 right-0"
        onClick={handleModal}
      />
    </div>
  );
};

const ModalBody = ({ className, children }) => {
  const classes = `modal-body my-6 ${className}`;
  return <div className={classes}>{children}</div>;
};

const ModalFooter = ({ className, children }) => {
  const classes = `modal-footer ${className}`;
  return <div className={classes}>{children}</div>;
};
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
