import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
function ContactLandlord() {
  const [loading, setLoading] = useState(true);
  const param = useParams();
  const search = new URLSearchParams(window.location.search);
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const getUser = async () => {
      const userRef = doc(db, "users", param.userId);
      const user = await getDoc(userRef);
      if (user.exists()) {
        setUser(user.data());
      } else {
        toast.error("Something went wrong,,");
      }
      setLoading(false);
    };
    getUser();
  }, []);

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {loading ? (
        <Spinner />
      ) : (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact {user.name}</p>
          </div>
          <form action="" className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name=""
                className="textarea"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                cols="10"
                rows="10"
              ></textarea>
            </div>
            <a
              href={`mailto:${user.email}?subject=${search.get(
                "listingName"
              )}&body=${message}`}
              className="primaryButton"
            >
              Send Message
            </a>
          </form>
        </main>
      )}
    </div>
  );
}

export default ContactLandlord;
