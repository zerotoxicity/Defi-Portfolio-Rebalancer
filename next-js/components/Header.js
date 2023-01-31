import Navbar from "./navbar/Navbar";

const Header = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default Header;
