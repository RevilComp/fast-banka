import LinkItem from "./LinkItem";

const Links = ({ links, onClick }) =>
  links.map((link) => <LinkItem link={link} onClick={onClick} />);

export default Links;
