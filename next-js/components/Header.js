import Navbar from "./navbar/Navbar";

/**
 * Header component that wraps NavBar around all children components
 * @example
 *
 * <Header>
 *   <Component {...pageProps} />
 * </Header>
 * @param {*} children  Children components such as the body of the webpage
 *
 */
const Header = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default Header;
