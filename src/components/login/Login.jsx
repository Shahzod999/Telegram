import { useEffect, useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [welcome, setWelcome] = useState(false);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password) {
      setLoading(false);
      return toast.warn("Please enter inputs!");
    }

    if (!avatar.file) {
      setLoading(false);
      return toast.warn("Please upload an avatar!");
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setLoading(false);
      return toast.warn("Select another username");
    }
    // Все что ниже это database
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      // создает базу
      await setDoc(doc(db, "users", res.user.uid), {
        username, // отправляем а базу данный имена и все остальные поля
        email, //
        avatar: imgUrl,
        id: res.user.uid, //
        blocked: [], //
      });
      // создает базу
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      // toast предепреждение та библиотека
      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error('Чтото Не Так');
      window.location.reload();
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUser(auth.currentUser);
    } catch (err) {
      console.log(err);
      toast.error('Чтото Не Так');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login">
      {welcome ? (
        <div className="item">
          <h2>Welcome back</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={loading}>{loading ? "Loading" : "Sign in"}</button>
          </form>
        </div>
      ) : (
        <div className="item">
          <h2>Create an Account</h2>
          <form onSubmit={handleRegister}>
            <label htmlFor="file">
              <img src={avatar.url || "./avatar.png"} alt="" />
              Upload an image
            </label>

            {loading && <span className="WitRegisterSign">Wait...Please</span>}

            <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
            <input type="text" placeholder="Username" name="username" />
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
          </form>
        </div>
      )}
      <div className="seperator" onClick={() => setWelcome(!welcome)}>
        {" "}
        {welcome ? "Register" : "Login"}
      </div>
    </div>
  );
};

export default Login;



// испарвить текст чтобы размер был по тексту
// исправить клавиатуру
// поиск пользователей не важно по высоте букв