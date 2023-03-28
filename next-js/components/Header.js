import Navbar from "./navbar/Navbar";

// Header component
const Header = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default Header;
