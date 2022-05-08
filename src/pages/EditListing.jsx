import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase.config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
function EditListing() {
  const [listing, setListing] = useState({});
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    offer: false,
    location: "",
    regularPrice: 0,
    address: "",
    lat: 0,
    lng: 0,
    imageUrls: {},
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
  });
  const params = useParams();
  const {
    name,
    type,
    bedrooms,
    bathrooms,
    parking,
    offer,
    furnished,
    location,
    regularPrice,
    discountedPrice,
    lat,
    lng,
    address,
    imageUrls,
  } = formData;
  const [loading, setLoading] = useState(false);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        console.log(docSnap.data());
        setFormData({
          ...docSnap.data(),
          lat: docSnap.data().geolocation.lat,
          lng: docSnap.data().geolocation.lng,
        });
        if (listing && auth.currentUser.uid !== docSnap.data().userRef)
          navigate("/");
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Can not find a listing");
      }
    };
    fetchListing();
  }, []);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...formData, userRef: user.uid });
      } else {
        navigate("/sign-in");
      }
    });
  }, []);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const geolocation = {};
    if (!geolocationEnabled) {
      geolocation.lat = +lat;
      geolocation.lng = +lng;
    }
    // Upload Images
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const imageRef = ref(storage, "images/" + fileName);
        const uploadTask = uploadBytesResumable(imageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...

            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };
    const imgsUrls = await Promise.all(
      [...imageUrls].map((el) => storeImage(el))
    ).catch(() => {
      setLoading(false);
      toast.error("Cannot Upload Images");
      return;
    });
    console.log(offer);
    const listingCop = {
      bathrooms: +bathrooms,
      bedrooms: +bedrooms,
      discountedPrice: +discountedPrice,
      regularPrice: +regularPrice,
      geolocation,
      location,
      name,
      offer,
      type,
      furnished,
      parking,
      timestamp: serverTimestamp(),
      imageUrls: imgsUrls,
      userRef: auth.currentUser.uid,
    };
    !offer && delete listingCop.discountedPrice;
    const listingRef = await updateDoc(
      doc(db, "listings", params.listingId),
      listingCop
    );
    setLoading(false);
    toast.success("Listing Updated");
    navigate(`/category/${type}/${params.listingId}`);
  };
  const onMutate = (e) => {
    e.preventDefault();

    let boolean = null;

    if (e.target.value === "true") boolean = true;
    if (e.target.value === "false") boolean = false;
    if (e.target.files) {
      setFormData((prev) => {
        return {
          ...prev,
          imageUrls: e.target.files,
        };
      });
    }
    if (!e.target.files) {
      setFormData((prev) => {
        return {
          ...prev,
          [e.target.id]: boolean ?? e.target.value,
        };
      });
    }
  };
  if (loading) return <Spinner />;
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit a listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={`formButton ${type === "sale" && "formButtonActive"}`}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={`formButton ${type === "rent" && "formButtonActive"}`}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            type="text"
            className="formInputName"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label htmlFor="" className="formLabel">
                Bedrooms
              </label>
              <input
                type="number"
                className="formInputSmall"
                id="bedrooms"
                min={1}
                max="50"
                value={bedrooms}
                onChange={onMutate}
              />
            </div>
            <div>
              <label htmlFor="" className="formLabel">
                Bathrooms
              </label>
              <input
                type="number"
                className="formInputSmall"
                id="bathrooms"
                min={1}
                max="50"
                value={bathrooms}
                onChange={onMutate}
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              type="button"
              className={parking ? "formButtonActive" : "formButton"}
              id="parking"
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!parking ? "formButtonActive" : "formButton"}
              id="parking"
              value="false"
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              type="button"
              className={furnished ? "formButtonActive" : "formButton"}
              id="furnished"
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!furnished ? "formButtonActive" : "formButton"}
              id="furnished"
              value="false"
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            type="text"
            id="location"
            className="formInputAddress"
            value={location}
            onChange={onMutate}
            required
          ></textarea>
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label htmlFor="" className="formLabel">
                  Latitude
                </label>
                <input
                  type="text"
                  className="formInputSmall"
                  id="lat"
                  value={lat}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label htmlFor="" className="formLabel">
                  Longitude
                </label>
                <input
                  type="text"
                  className="formInputSmall"
                  id="lng"
                  value={lng}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              type="button"
              className={offer ? "formButtonActive" : "formButton"}
              id="offer"
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!offer ? "formButtonActive" : "formButton"}
              id="offer"
              value="false"
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="" className="formLabel">
            Regular Price
          </label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              minLength={50}
              maxLength={750000000}
              type="number"
              value={regularPrice}
              onChange={onMutate}
              id="regularPrice"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label htmlFor="" className="formLabel">
                Discounted Price
              </label>
              <div className="formPriceDiv">
                <input
                  className="formInputSmall"
                  minLength={50}
                  maxLength={750000000}
                  type="number"
                  value={discountedPrice}
                  onChange={onMutate}
                  id="discountedPrice"
                  required
                />
                {type === "rent" && <p className="formPriceText">$ / Month</p>}
              </div>{" "}
            </>
          )}
          <label htmlFor="" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            type="file"
            accept=".jpg,.png,.jpeg"
            max="6"
            id="imageUrls"
            multiple
            required
            onChange={onMutate}
            className="formInputFile"
          />
          <button className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListing;
