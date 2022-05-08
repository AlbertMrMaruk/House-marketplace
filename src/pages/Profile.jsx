import { getAuth, updateProfile } from "firebase/auth";
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";
import ListingComponent from "../components/ListingComponent";

function Profile() {
  const auth = getAuth();
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changeDetails, setChangeDetails] = useState(false);
  const { name, email } = formData;
  const navigate = useNavigate();
  const onLogOut = () => {
    auth.signOut();
    navigate("/");
  };
  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };
  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error("Could not update prodile details");
    }
  };
  useEffect(() => {
    const getListings = async () => {
      const docRef = collection(db, "listings");
      const q = query(
        docRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const listingsArr = [];
      const querySnap = await getDocs(q);

      querySnap.forEach((el) => {
        return listingsArr.push({
          id: el.id,
          data: el.data(),
        });
      });

      setListings(listingsArr);
      setLoading(false);
    };
    getListings();
  }, []);
  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", id));
      const updatedListings = listings.filter((el) => el.id !== id);
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  };
  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogOut}>
          Log Out
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prev) => !prev);
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or Rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList" style={{ padding: "0px" }}>
              {listings.map(({ id, data }) => (
                <ListingComponent
                  key={id}
                  listing={data}
                  id={id}
                  onDelete={() => onDelete(id)}
                  onEdit={() => navigate(`/edit-listing/${id}`)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
