import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as OfferIcon } from "../assets/svg/localOfferIcon.svg";
import { ReactComponent as ExploreIcon } from "../assets/svg/exploreIcon.svg";
import { ReactComponent as PersonOutlineIcon } from "../assets/svg/personOutlineIcon.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = (path) => path === location.pathname;
  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={() => navigate("/")}>
            <ExploreIcon
              fill={activePage("/") ? "#2c2c2c" : "#8f8f8f"}
              width="36px"
              height="36px"
            />
            <p
              className={
                activePage("/")
                  ? "navbarListItemNameActive"
                  : "navbarListItemName"
              }
            >
              Explore
            </p>
          </li>
          <li className="navbarListItem" onClick={() => navigate("/offers")}>
            <OfferIcon
              fill={activePage("/offers") ? "#2c2c2c" : "#8f8f8f"}
              width="36px"
              height="36px"
            />
            <p
              className={
                activePage("/offers")
                  ? "navbarListItemNameActive"
                  : "navbarListItemName"
              }
            >
              Offers
            </p>
          </li>
          <li className="navbarListItem" onClick={() => navigate("/profile")}>
            <PersonOutlineIcon
              fill={activePage("/profile") ? "#2c2c2c" : "#8f8f8f"}
              width="36px"
              height="36px"
            />
            <p
              className={
                activePage("/profile")
                  ? "navbarListItemNameActive"
                  : "navbarListItemName"
              }
            >
              Profile
            </p>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Navbar;
