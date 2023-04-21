import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase.config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import googleIcon from "../assets/svg/googleIcon.svg";

function OAth() {
  const navigate = useNavigate();
  const location = useLocation();
  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      console.log(res);
      const user = res.user;
      // Check for User
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      // If user, doesn't exist, then create
      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (error) {
      toast.error("Could not authorize with Google");
    }
  };
  return (
    <div className="socialLogin">
      <p>Sign {location.pathname.includes("in") ? "In" : "Up"} with</p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img src={googleIcon} alt="Google Auth" className="socialIconImg" />
      </button>
    </div>
  );
}

export default OAth;
