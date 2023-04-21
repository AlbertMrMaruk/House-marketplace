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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreateListing() {
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: "false",
    furnished: "false",
    offer: "false",
    regularPrice: 0,
    address: "",
    imageUrls: {},
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
  });
  const {
    name,
    type,
    bedrooms,
    bathrooms,
    parking,
    offer,
    furnished,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    address,
    imageUrls,
  } = formData;
  const [loading, setLoading] = useState(false);
  const geolocationEnabled = false;
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...formData, userRef: user.uid });
      } else {
        navigate("/sign-in");
      }
    });
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let location = "";
    const geolocation = {};
    location = address;
    if (!geolocationEnabled) {
      geolocation.lat = +latitude;
      geolocation.lng = +longitude;
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
              default:
                break;
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
    const imgUrls = await Promise.all(
      [...imageUrls].map((el) => storeImage(el))
    ).catch(() => {
      setLoading(false);
      toast.error("Cannot Upload Images");
      return;
    });
    const listing = {
      bathrooms: +bathrooms,
      bedrooms: +bedrooms,
      discountedPrice: +discountedPrice,
      regularPrice: +regularPrice,
      geolocation,
      location,
      name,
      offer: offer === "true",
      type,
      furnished: furnished === "true",
      parking: parking === "true",
      timestamp: serverTimestamp(),
      imageUrls: imgUrls,
      userRef: auth.currentUser.uid,
    };
    !offer && delete listing.discountedPrice;
    const listingRef = await addDoc(collection(db, "listings"), listing);
    setLoading(false);
    toast.success("Listing Created");
    navigate(`/category/${type}/${listingRef.id}`);
  };
  const onMutate = (e) => {
    e.preventDefault();
    let boolean = e.target.value;
    if (boolean === "true") boolean = true;
    if (boolean === "false") boolean = false;
    if (e.target.files) {
      setFormData({
        ...formData,
        imageUrls: e.target.files,
      });
    }
    if (!e.target.files) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };
  if (loading) return <Spinner />;
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a listing</p>
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
              className={parking === "true" ? "formButtonActive" : "formButton"}
              id="parking"
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                parking === "false" ? "formButtonActive" : "formButton"
              }
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
              className={
                furnished === "true" ? "formButtonActive" : "formButton"
              }
              id="furnished"
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                furnished === "false" ? "formButtonActive" : "formButton"
              }
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
            id="address"
            className="formInputAddress"
            value={address}
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
                  id="latitude"
                  value={latitude}
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
                  id="longitude"
                  value={longitude}
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
              className={offer === "true" ? "formButtonActive" : "formButton"}
              id="offer"
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={offer === "false" ? "formButtonActive" : "formButton"}
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
          {offer === "true" && (
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
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
