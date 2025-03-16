import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';
import './style.css';

interface UserProfile {
  username: string;
  fullName: string;
  dateofbirth: string;
  phonenumber: string;
  email: string;
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    fullName: "",
    dateofbirth: "",
    phonenumber: ""
  });
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoading(true);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              username: data.username || user.email || "",
              fullName: data.fullName,
              dateofbirth: data.dateofbirth,
              phonenumber: data.phonenumber,
              email: data.email,
              avatarUrl: data.avatarUrl || user.photoURL || ""
            });
            setIsEditing(false);
          } else {
            setIsEditing(true);
            setFormData({
              fullName: user.displayName || "",
              dateofbirth: "",
              phonenumber: ""
            });
            setProfile({
              username: user.email || "",
              fullName: user.displayName || "",
              dateofbirth: "",
              phonenumber: "",
              email: user.email || "",
              avatarUrl: user.photoURL || ""
            });
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin hồ sơ:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  if (isLoading) {
    return (
      <div className="profile-loader-container">
        <div className="profile-loader"></div>
      </div>
    );
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser) {
      try {
        const updatedUsername = profile && profile.username ? profile.username : (currentUser.email || "");
        const updatedProfile: UserProfile = {
          username: updatedUsername,
          fullName: formData.fullName,
          dateofbirth: formData.dateofbirth,
          phonenumber: formData.phonenumber,
          email: currentUser.email || "",
          avatarUrl: currentUser.photoURL || ""
        };
        await setDoc(doc(db, "users", currentUser.uid), updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);
      } catch (error) {
        console.error("Lỗi khi cập nhật hồ sơ:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        dateofbirth: profile.dateofbirth,
        phonenumber: profile.phonenumber,
      });
    }
    setIsConfirmed(false);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <h1>Thông Tin Người Dùng</h1>
      {profile && !isEditing ? (
        <div className="profile-info">
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl ? profile.avatarUrl : "/avt.jpg"}
              alt="Ảnh đại diện"
              className="profile-avatar"
            />
          )}
          <p><strong>Tên đăng nhập:</strong> {profile.username}</p>
          <p><strong>Họ và Tên:</strong> {profile.fullName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Ngày Sinh:</strong> {profile.dateofbirth || "Chưa cập nhật"}</p>
          <p><strong>Số Điện Thoại:</strong> {profile.phonenumber || "Chưa cập nhật"}</p>
          <div className="profile-button-group">
            <button 
              className="profile-submit-button" 
              onClick={() => {
                if (profile) {
                  setFormData({
                    fullName: profile.fullName,
                    dateofbirth: profile.dateofbirth,
                    phonenumber: profile.phonenumber,
                  });
                }
                setIsConfirmed(false);
                setIsEditing(true);
              }}
            >
              Cập nhật thông tin
            </button>
            {/* <button className="profile-submit-button" onClick={() => }>
              Đổi mật khẩu
            </button> */}
          </div>
        </div>
      ) : currentUser ? (
        <form onSubmit={handleFormSubmit} className="profile-form">
          <h2>Cập nhật thông tin người dùng</h2>
          <div className="profile-form-group">
            <label>Họ và Tên:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="profile-form-group">
            <label>Ngày Sinh:</label>
            <input
              type="date"
              name="dateofbirth"
              value={formData.dateofbirth}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="profile-form-group">
            <label>Số Điện Thoại:</label>
            <input
              type="text"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="profile-stick-group">
            <label>
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />{" "}
              Xác nhận sửa đổi thông tin
            </label>
          </div>
          {isConfirmed ? (
            <button type="submit" className="profile-submit-button">
              Lưu thông tin
            </button>
          ) : (
            <button type="button" className="profile-submit-button" onClick={handleCancelEdit}>
              Trở về
            </button>
          )}
        </form>
      ) : (
        <p>Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.</p>
      )}
    </div>
  );
};

export default ProfilePage;
