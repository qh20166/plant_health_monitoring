import React, { useState, useEffect } from "react";
import "./style.css";
import sendIcon from "../../assets/send_icon.png";
import axios from "axios";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
  where
} from "firebase/firestore";
import { db } from "../../components/firebaseConfig";

interface Message {
  question: string;
  answer: string;
  createdAt: string;
}

const USERNAME = "huy0403";
const API_KEY = process.env.ADAFRUIT_IO_KEY ?? "";


const PromptPage: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [hasAnswer, setHasAnswer] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(window.innerWidth > 768);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchHistoryFromFirebase = async () => {
    try {
      const qRef = query(
        collection(db, "messages"),
        where("userId", "==", USERNAME),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(qRef);
      const fetchedHistory: Message[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        const timeString = data.createdAt
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString();
        fetchedHistory.push({
          question: data.question || "",
          answer: data.answer || "",
          createdAt: timeString,
        });
      });
      setMessageHistory(fetchedHistory);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử từ Firestore:", error);
    }
  };

  useEffect(() => {
    fetchHistoryFromFirebase();
    const handleResize = () => setShowHistory(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    setHasAnswer(false);
    setSelectedMessage(null);
    const currentDate = new Date().toISOString();
    
    try {
      const postResponse = await axios.post(
        `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-prompt/data`,
        { value: question },
        {
          headers: {
            "Content-Type": "application/json",
            "X-AIO-Key": API_KEY,
          },
        }
      );
      const data = postResponse.data;
      const fetchedAnswer = data.last_value || "Không có câu trả lời.";

      await addDoc(collection(db, "messages"), {
        userId: USERNAME,
        question: question,
        answer: fetchedAnswer,
        createdAt: serverTimestamp(),
      });

      setMessageHistory((prev) => [
        { question, answer: fetchedAnswer, createdAt: currentDate },
        ...prev,
      ]);

      setQuestion("");
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      setAnswer("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      setHasAnswer(true);
    }
    setIsLoading(false);
  };

  const handleHistoryClick = (msg: Message) => {
    setSelectedMessage(msg);
    setQuestion(msg.question);
    setAnswer(msg.answer);
    setHasAnswer(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  };

  return (
    <div className="prompt-container">
      <button className="toggle-history-button" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Ẩn lịch sử" : "Hiện lịch sử"}
      </button>
      {showHistory && (
        <nav className="prompt-navbar">
          <h3>Lịch sử tin nhắn</h3>
          <ul>
            {messageHistory.map((msg, index) => (
              <li key={index} onClick={() => handleHistoryClick(msg)} className="history-item">
                <strong>{formatDate(msg.createdAt)}:</strong>
                <p className="question-text">{msg.question}</p>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="prompt-left-content">
        {!hasAnswer && <h2 className="prompt-main-title">Vui lòng nhập câu hỏi về tình trạng cây của bạn</h2>}
        <div className="prompt-bubble">
          <div className="prompt-bubble-input-row">
            <textarea
              placeholder="Ví dụ: Cây của tôi có dấu hiệu bị bệnh không?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            <button className="prompt-send-button" onClick={handleSend} disabled={isLoading}>
              {isLoading ? (
                <div className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              ) : (
                <img src={sendIcon} alt="Gửi" />
              )}
            </button>
          </div>
        </div>
        {hasAnswer && (
          <div className="prompt-bubble-answer">
            <div className="answer-header">
              <span className="status-indicator"></span>
              <h3>{selectedMessage ? "Chi tiết tin nhắn" : "Kết quả phân tích"}</h3>
            </div>
            <p className="answer-content">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPage;
