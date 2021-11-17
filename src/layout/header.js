import { Link } from "react-router-dom";
import "./header.css";
import logoSvg from "../assets/logo-light.svg";
import hamburgerSvg from "../assets/icon-hamburger.svg";
import bicycle400Svg from "../assets/icon-bicycle-400.svg";
import routeSvg from "../assets/icon-route.svg";
import vacationSvg from "../assets/icon-vacation.svg";
import phoneSvg from "../assets/icon-phone.svg";

function Logo() {
  return (
    <h1 className="logo">
      <Link to="/">
        <img src={logoSvg} alt="Bikeland" />
      </Link>
    </h1>
  );
}

function Hamburger() {
  return (
    <div className="hamburger">
      <img src={hamburgerSvg} alt="menu icon" />
    </div>
  );
}

const emergencyPhone = (
  <a href="tel: +886-800-001922" className="emergency_phone">
    <div className="navlink_img">
      <img src={phoneSvg} alt="phone icon" />
    </div>
    <h2 className="typography-bold typography-caption">聯絡單車客服</h2>
  </a>
);

function Nav(props) {
  const navLinkInfo = [
    {
      linkPath: "/",
      imgSrc: bicycle400Svg,
      imgAlt: "bicycle icon",
      linkText: "找單車",
    },
    {
      linkPath: "/route",
      imgSrc: routeSvg,
      imgAlt: "route icon",
      linkText: "找路線",
    },
    {
      linkPath: "/scene",
      imgSrc: vacationSvg,
      imgAlt: "vacation icon",
      linkText: "找景點",
    },
  ];
  return (
    <nav>
      <div className="nav_wrapper">
        {navLinkInfo.map(({ linkPath, imgSrc, imgAlt, linkText }) => (
          <Link key={linkText} to={linkPath}>
            <div className="navlink_img">
              <img src={imgSrc} alt={imgAlt} />
            </div>
            <h2 className="typography-bold typography-caption">{linkText}</h2>
          </Link>
        ))}
      </div>
      {emergencyPhone}
    </nav>
  );
}

function Header(props) {
  console.log("hello header");
  return (
    <header>
      <div className="header_wrapper">
        <Logo />
        <Hamburger />
      </div>
      <Nav />
    </header>
  );
}

export default Header;
