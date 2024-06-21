const Card = ({ children, className }) => (
  <div
    className={`card bg-white border shadow-sm rounded w-full p-6 lg:p-12 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

const CardBody = ({ className, children }) => (
  <div className={`card-body w-full ${className}`}>{children}</div>
);

const CardFooter = ({ className, children }) => (
  <div className={`card-footer w-full ${className}`}>{children}</div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
