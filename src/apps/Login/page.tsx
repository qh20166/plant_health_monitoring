import React, { useState, FormEvent } from "react";
import "./style.css";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { auth, provider, db } from "../../components/firebaseConfig";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { login } = useAuth();

  const LoadingDots = () => (
    <div className="loading-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setErrorMessage("Username không tồn tại.");
        setIsSubmitting(false);
        return;
      }
      let emailFromDB = "";
      let avatarUrlFromDB = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        emailFromDB = data.email;
        avatarUrlFromDB = data.avatarUrl || "";
      });
      const userCredential = await signInWithEmailAndPassword(auth, emailFromDB, password);
      const user = userCredential.user;
      localStorage.setItem("accessToken", user.uid);
      localStorage.setItem("username", user.displayName || username);
      localStorage.setItem("avatarUrl", avatarUrlFromDB || "/avt.jpg");
      login();
      window.location.href = "/monitor";
    } catch (error: any) {
      console.error("Error during login:", error);
      if (error.code === "auth/wrong-password") {
        setErrorMessage("Sai mật khẩu.");
      } else {
        setErrorMessage("Đăng nhập thất bại, vui lòng thử lại.");
      }
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem("accessToken", user.uid);
      localStorage.setItem("username", user.displayName || "");
      localStorage.setItem("avatarUrl", user.photoURL || "/avt.jpg");
      login();
      window.location.href = "/monitor";
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("Đăng nhập với Google thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left-container">
        <h1>Chào mừng đến với chúng tôi</h1>
        <p>Đăng nhập để khám phá các tính năng tuyệt vời!</p>
      </div>
      <div className="login-container">
        <h1>Đăng nhập</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button primary type="submit" disabled={isSubmitting} className="Button">
            {isSubmitting ? (
              <div className="loading-spinner">
                <LoadingDots />
              </div>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>
        <div style={{ marginTop: "20px" }}>
          <Button primary onClick={handleGoogleLogin} className="login-container-GGButton">
            Đăng nhập với Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
