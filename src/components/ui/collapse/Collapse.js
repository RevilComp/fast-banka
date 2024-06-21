import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const Collapse = ({ show, className, children }) => {
  const ref = useRef(null);
  const [heightValue, setHeightValue] = useState(0);

  useEffect(() => {
    if (ref.current) {
      if (show) setHeightValue(ref.current.scrollHeight);
      else setHeightValue(0);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: [0, 1], height: heightValue }}
          transition={{ ease: "easeOut", duration: 0.25 }}
          className={`z-10 ${className}`}
          ref={ref}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};

const CollapseItem = ({ className, children }) => (
  <li className={className}>{children}</li>
);

Collapse.Item = CollapseItem;

export default Collapse;
