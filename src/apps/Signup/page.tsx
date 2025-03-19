import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import Button from "../../components/Button";
import "./style.css";
import { auth, db } from "../../components/firebaseConfig";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateofbirth: string;
  fullname: string;
  phonenumber: string;
}

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateofbirth: "",
    fullname: "",
    phonenumber: ""
  });
  const LoadingDots = () => (
    <div className="loading-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  );
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const phoneRegex = /^[0-9]{10,}$/;
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.dateofbirth ||
      !formData.fullname ||
      !formData.phonenumber
    ) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return false;
    }
    if (!phoneRegex.test(formData.phonenumber)) {
      setError("Số điện thoại phải có ít nhất 10 chữ số.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const usernameQuery = query(collection(db, "users"), where("username", "==", formData.username));
      const querySnapshot = await getDocs(usernameQuery);
      if (!querySnapshot.empty) {
        setError("Username đã tồn tại. Vui lòng chọn username khác.");
        setIsSubmitting(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: formData.username });
      await setDoc(doc(db, "users", user.uid), {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullname,
        dateofbirth: formData.dateofbirth,
        phonenumber: formData.phonenumber,
      });
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.");
          break;
        case "auth/invalid-email":
          setError("Email không hợp lệ.");
          break;
        case "auth/weak-password":
          setError("Mật khẩu yếu. Vui lòng chọn mật khẩu mạnh hơn.");
          break;
        case "auth/operation-not-allowed":
          setError("Tạo tài khoản bằng email/mật khẩu không được phép.");
          break;
        case "auth/too-many-requests":
          setError("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
          break;
        case "auth/network-request-failed":
          setError("Kết nối mạng thất bại. Vui lòng kiểm tra kết nối của bạn.");
          break;
        case "auth/internal-error":
          setError("Có lỗi nội bộ. Vui lòng thử lại sau.");
          break;
        case "auth/user-disabled":
          setError("Tài khoản này đã bị vô hiệu hóa.");
          break;
        default:
          setError("Có lỗi xảy ra. Vui lòng thử lại!");
          break;
      }
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1>Đăng ký</h1>
        {error && <p className="signup-error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="signup-form-columns">
            <div className="signup-form-column">
              <div className="input-field">
                <label className="input-label">Tên đăng nhập</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="input-field">
                <label className="input-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-field">
                <label className="input-label">Mật khẩu</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="input-field">
                <label className="input-label">Xác nhận mật khẩu</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            <div className="signup-form-column">
              <div className="input-field">
                <label className="input-label">Ngày sinh</label>
                <input type="date" name="dateofbirth" value={formData.dateofbirth} onChange={handleChange} required />
              </div>
              <div className="input-field">
                <label className="input-label">Họ và tên</label>
                <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} required />
              </div>
              <div className="input-field">
                <label className="input-label">Số điện thoại</label>
                <input type="text" name="phonenumber" value={formData.phonenumber} onChange={handleChange} required />
              </div>
              <Button primary type="submit" disabled={isSubmitting} className="Button">
                {isSubmitting ? (
                  <div className="loading-spinner">
                    <LoadingDots />
                  </div>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
