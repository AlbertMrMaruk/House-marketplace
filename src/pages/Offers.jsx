import { useEffect, useState } from "react";
import ListingComponent from "../components/ListingComponent";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
function Offers() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastListing, setLastListing] = useState(null);
  useEffect(() => {
    const getListings = async () => {
      try {
        //Get a referee
        const docsRef = collection(db, "listings");
        // Create a query
        const q = query(
          docsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        //Execute a query
        const querySnap = await getDocs(q);
        const listingsArr = [];
        querySnap.forEach((el) => {
          return listingsArr.push({
            id: el.id,
            data: el.data(),
          });
        });
        setLastListing(querySnap.docs[querySnap.docs.length - 1]);
        setListings(listingsArr);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };
    getListings();
  }, []);
  const onGetMoreListings = async () => {
    try {
      //Get a referee
      const docsRef = collection(db, "listings");
      // Create a query
      console.log(lastListing);
      const q = query(
        docsRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastListing),
        limit(2)
      );
      //Execute a query
      const querySnap = await getDocs(q);
      const listingsArr = [];
      querySnap.forEach((el) => {
        return listingsArr.push({
          id: el.id,
          data: el.data(),
        });
      });
      setListings((prev) => [...prev, ...listingsArr]);
      setLastListing(querySnap.docs[querySnap.docs.length - 1]);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
    }
  };
  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingComponent
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </main>
        </>
      ) : (
        <p>No current offers</p>
      )}
      {lastListing && (
        <>
          <p className="loadMore" onClick={onGetMoreListings}>
            Load More
          </p>
        </>
      )}
    </div>
  );
}

export default Offers;
