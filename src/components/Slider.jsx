import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import { getDocs, query, limit, orderBy, collection } from "firebase/firestore";

function Slider() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  useEffect(() => {
    const getListings = async () => {
      const docRef = collection(db, "listings");
      const q = query(docRef, limit(3), orderBy("timestamp", "asc"));
      const querySnap = await getDocs(q);
      const listingsArr = [];
      if (querySnap) {
        querySnap.forEach((el) => {
          listingsArr.push({
            id: el.id,
            data: el.data(),
          });
        });
        setListings(listingsArr);
      }
      setLoading(false);
    };
    getListings();
  }, []);
  if (loading) {
    return <Spinner />;
  }
  if (listings.length === 0) return <></>;
  return (
    <>
      <p className="exploreHeading">Recommended</p>

      <Swiper
        spaceBetween={50}
        modules={[Navigation, Pagination, A11y, Scrollbar]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        className="swiper-container"
      >
        {listings.map(({ id, data }) => (
          <SwiperSlide
            key={id}
            onClick={() => navigate(`/category/${data.type}/${id}`)}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                background: `url(${data.imageUrls[0]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            >
              <p className="swiperSlideText">{data.name}</p>
              <p className="swiperSlidePrice">
                ${data.offer ? data.discountedPrice : data.regularPrice}{" "}
                {data.type === "rent" && " / month"}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}

export default Slider;
