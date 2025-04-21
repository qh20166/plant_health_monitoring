import React, { useState, useEffect } from "react";
import "./style.css";
import {
  collection,
  getDocs,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../components/firebaseConfig";

interface AnalysisEntry {
  imageUrl: string;
  plantStatus: string;
  temperature: number;
  humidity: number;
  createdAt: any;
}

const USERNAME = "huy0403";

const PromptPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AnalysisEntry | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(window.innerWidth > 768);

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, "analyses"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const entries: AnalysisEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        entries.push({
          imageUrl: data.imageUrl || "",
          plantStatus: data.plantStatus || "",
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        });
      });
      setHistory(entries);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handleResize = () => setShowHistory(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="prompt-container">
      <button
        className="toggle-history-button"
        onClick={() => setShowHistory((v) => !v)}
      >
        {showHistory ? "Ẩn lịch sử" : "Hiện lịch sử"}
      </button>

      {showHistory && (
        <nav className={`prompt-navbar ${showHistory ? "active" : ""}`}>
          <h3>Lịch sử phân tích</h3>
          <ul>
            {history.map((entry, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSelectedEntry(entry);
                  if (window.innerWidth <= 768) {
                    setShowHistory(false); // 👉 Tự động ẩn lịch sử khi là mobile
                  }
                }}
                className="history-item"
              >
                <strong>{formatDate(new Date(entry.createdAt))}:</strong>
                <p className="question-text">{entry.plantStatus}</p>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="prompt-left-content">
        {selectedEntry ? (
          <div className="prompt-bubble-answer">
            <div className="answer-header">
              <span className="status-indicator"></span>
              <h3 >Chi tiết phân tích</h3>
            </div>
            <div className="modal-image">
              <img
                src={`data:image/jpeg;base64,${selectedEntry.imageUrl}`}
                alt="Ảnh phân tích"
              />
            </div>
            <div className="answer-content">
              <p><strong>Tình trạng cây:</strong> {selectedEntry.plantStatus}</p>
              <p><strong>Nhiệt độ:</strong> {selectedEntry.temperature} °C</p>
              <p><strong>Độ ẩm:</strong> {selectedEntry.humidity} %</p>
              <p><strong>Ngày phân tích:</strong> {formatDate(new Date(selectedEntry.createdAt))}</p>
            </div>
          </div>
        ) : (
          <h2 className="prompt-main-title">
            Chọn một mục lịch sử để xem chi tiết
          </h2>
        )}
      </div>
    </div>
  );
};

export default PromptPage;
