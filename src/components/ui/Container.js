const Container = ({ children, className }) => (
  <div className={`container min-w-full px-4 lg:px-6 ${className}`}>
    {children}
  </div>
);

export default Container;
