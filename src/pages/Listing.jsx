import { Link, useParams } from "react-router-dom";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";

function Listing() {
  const param = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState({});
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const auth = getAuth();
  useEffect(() => {
    const getListing = async () => {
      const listingRef = doc(db, "listings", param.id);
      const listing = await getDoc(listingRef);
      if (listing.exists()) {
        setListing(listing.data());
        setLoading(false);
      }
    };
    getListing();
  });
  if (loading) return <Spinner />;

  return (
    <main>
      <Swiper
        spaceBetween={50}
        modules={[Navigation, Pagination, A11y, Scrollbar]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        className="swiper-container"
      >
        {listing.imageUrls.map((el, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imageUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="Share" />
        {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}
      </div>
      <div className="listingDetails">
        <p className="listingName">
          {listing.name +
            " - $" +
            (listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type[0].toUpperCase() + listing.type.slice(1)}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            $
            {(listing.regularPrice - listing.discountedPrice)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " "}
            discount
          </p>
        )}
        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : `1 Bedroom`}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : `1 Bathroom`}
          </li>
          {listing.parkingSpot && <li>Parking Spot</li>}
          {listing.furnished && <li>Furnished</li>}
        </ul>
        <p className="listingLocationTitle">Location</p>

        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/
        copyright">0penStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/
        {z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}&listingLocation=${listing.location}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}
export default Listing;
