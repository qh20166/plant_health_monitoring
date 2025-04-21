import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import './style.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import InfoBox from './InfoBox/page';
import dateIcon from '../../assets/date_icon.png';
import timeIcon from '../../assets/time_icon.png';
import tempIcon from '../../assets/temperature_icon.png';
import humiIcon from '../../assets/humidity_icon.png';
import lightOnIcon from '../../assets/lighton_icon.png';
import lightOffIcon from '../../assets/lightoff_icon.png';
import sprinkleOnIcon from '../../assets/sprinkleon_icon.png';
import optionIcon from '../../assets/option_icon.png';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../components/firebaseConfig';
import { toast } from 'react-toastify';

interface SensorData {
  day: string;
  temperature: number;
  humidity: number;
}
interface AnalysisData {
  imageUrl: string;
  plantStatus: string;
  temperature: number;
  humidity: number;
  createdAt: any;

}

const USERNAME = "huy0403";
const API_KEY = process.env.REACT_APP_ADAFRUIT_IO_KEY ?? "";

const MonitorReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [useAutoTime, setUseAutoTime] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [chartType, setChartType] = useState<'temperature' | 'humidity'>('temperature');
  const [lightOn, setLightOn] = useState<boolean>(false);
  const [sprinkleOn, setSprinkleOn] = useState<boolean>(false);
  const [showIrrigationModal, setShowIrrigationModal] = useState<boolean>(false);
  const [auto_temp, setAutoTemp] = useState<string>("");
  const [auto_humi, setAutoHumi] = useState<string>("");
  const [plantStatus, setPlantStatus] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showPlantStatus, setShowPlantStatus] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const irrigationModalRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const plantStatusRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showIrrigationModal &&
        irrigationModalRef.current &&
        !irrigationModalRef.current.contains(event.target as Node)
      ) {
        setShowIrrigationModal(false);
      }
      if (
        showCalendar &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
      if (
        showPlantStatus &&
        plantStatusRef.current &&
        !plantStatusRef.current.contains(event.target as Node)
      ) {
        setShowPlantStatus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIrrigationModal, showCalendar, showPlantStatus]);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const tempRes = await axios.get(
          `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-temp/data?X-AIO-Key=${API_KEY}`
        );
        const humiRes = await axios.get(
          `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-humi/data?X-AIO-Key=${API_KEY}`
        );
        const tempData = tempRes.data.slice(0, 30).map((item: { created_at: string; value: string }) => ({
          day: new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
          temperature: parseFloat(item.value),
          humidity: 0,
        }));
    
        const humiData = humiRes.data.slice(0, 30).map((item: { created_at: string; value: string }) => ({
          day: new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
          temperature: 0,
          humidity: parseFloat(item.value),
        }));
    
        const mergedData = tempData.map((tempItem: { day: string; temperature: number }, index: number) => ({
          ...tempItem,
          humidity: humiData[index] ? humiData[index].humidity : 0,
        }));

        setChartData([...mergedData].reverse());
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu lịch sử:", error);
  }
    };

    fetchHistoricalData();
  }, []);

  useEffect(() => {
    if (useAutoTime) {
      const updateTime = () => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSelectedTime(now);
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [useAutoTime]);

  useEffect(() => {
    fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-temp`, {
      headers: { "X-AIO-Key": API_KEY }
    })
      .then((res) => res.json())
      .then((data) => {
        const temp = parseFloat(data.last_value);
        setTemperature(temp);
        setChartData(prev => [...prev, { day: "Hôm nay", temperature: temp, humidity: 0 }]);
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu nhiệt độ:", err));

    fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-humi`, {
      headers: { "X-AIO-Key": API_KEY }
    })
      .then((res) => res.json())
      .then((data) => {
        const hum = parseFloat(data.last_value);
        setHumidity(hum);
        setChartData(prev => {
          if (prev.length > 0) {
            const lastIndex = prev.length - 1;
            const newEntry = { ...prev[lastIndex], humidity: hum };
            const newChartData = [...prev];
            newChartData[lastIndex] = newEntry;
            return newChartData;
          }
          return [{ day: "Hôm nay", temperature: 0, humidity: hum }];
        });
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu độ ẩm:", err));

    fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-image`, {
      headers: { "X-AIO-Key": API_KEY }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.last_value) {
          setImageUrl(data.last_value);
        }
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu hình ảnh:", err));

    fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-led`, {
      headers: { "X-AIO-Key": API_KEY }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.last_value) {
          setLightOn(data.last_value.toLowerCase() === "on");
        }
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu đèn:", err));
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
    setUseAutoTime(false);
  };

  const handleUseCurrentTime = () => {
    setUseAutoTime(true);
  };

  const handleSprinkleAction = async () => {
    try {
      const response = await axios.post(
        `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-pump/data`,
        { value: "1" },
        {
          headers: {
            "Content-Type": "application/json",
            "X-AIO-Key": API_KEY
          }
        }
      );
      toast.success("Đã tưới cây thành công.");
      console.log("Phản hồi POST cho hệ thống tưới nước:", response.data);
      if (response.data.last_value && response.data.last_value.toLowerCase() === "activate") {
        setSprinkleOn(true);
      }
    } catch (error) {
      console.error("Lỗi khi kích hoạt hệ thống tưới nước:", error);
    }
  };

  const handleToggleLight = async (checked: boolean) => {
    try {
      const newState = checked ? "ON" : "OFF";
      const response = await axios.post(
        `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-led/data`,
        { value: newState },
        { headers: { "X-AIO-Key": API_KEY } }
      );
      if (response.data.value === newState) {
        setLightOn(checked);
      }
      toast.success("Đã chuyển trạng thái của đèn.");

    } catch (error) {
      console.error("Lỗi khi chuyển trạng thái đèn:", error);
      setLightOn(!checked);
    }
  };

  const handleCapture = async () => {
    try {
      setIsLoading(true);
      
      // Gửi yêu cầu chụp ảnh
      await axios.post(
        `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-selectimage/data`,
        { value: "1" },
        { headers: { "Content-Type": "application/json", "X-AIO-Key": API_KEY } }
      );
      
      await delay(10000);
      
      // Lấy dữ liệu ảnh
      const imageResponse = await fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-image`, {
        headers: { "X-AIO-Key": API_KEY }
      });
      const imageData = await imageResponse.json();
      
      // Lấy dữ liệu phân tích
      const promptResponse = await fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-prompt`, {
        headers: { "X-AIO-Key": API_KEY }
      });
      const promptData = await promptResponse.json();

      // Lưu dữ liệu vào Firebase
      const analysisData: AnalysisData = {
        imageUrl: imageData.last_value || "",
        plantStatus: promptData.last_value || "Không có dữ liệu",
        temperature: temperature || 0,
        humidity: humidity || 0,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "analyses"), analysisData);

      // Cập nhật state và hiển thị
      if (imageData.last_value) setImageUrl(imageData.last_value);
      if (promptData.last_value) setPlantStatus(promptData.last_value);
      
      toast.success("Phân tích và lưu dữ liệu thành công!");
      setShowPlantStatus(true);
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Có lỗi xảy ra trong quá trình phân tích!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIrrigationMode = async (mode: string, value_temp: string, value_humi: string) => {
    try {
      await axios.post(
        `https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-request/data`,
        {
          value: mode,
          ...(mode === 'auto' ? { value: 'automatic-water' + ':' + value_temp + ':' + value_humi } : {})
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-AIO-Key": API_KEY,
          },
        }
      );
      toast.success("Đã hoàn tất cài đặt chế độ tưới cây.");

      setShowIrrigationModal(false);
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  return (
    <div className="mrp-container">
      <button 
        className="show-control-button" 
        onClick={() => setShowOptions(!showOptions)}
      >
        <img src={optionIcon} alt="Options" style={{ width: '24px', height: '24px' }} />
      </button>
      {showOptions && (
        <div className="control-panel">
          <div className="time-control">
            <label>Chọn giờ:</label>
            <input type="time" value={selectedTime} onChange={handleTimeChange} step="300" />
            {/* <button className="time-button" onClick={handleUseCurrentTime}>
              Sử dụng giờ hiện tại
            </button> */}
          </div>
          <button className="control-button" onClick={() => setShowIrrigationModal(true)}>
            Chọn chế độ tưới tiêu
          </button>
          <button className="control-button" onClick={() => setShowCalendar(true)}>
            Chọn Ngày
          </button>
        </div>
      )}
      <div className="mrp-top-info">
        <InfoBox label="Giờ" value={selectedTime} icon={timeIcon} />
        <InfoBox label="Ngày" value={selectedDate.toLocaleDateString()} icon={dateIcon} />
        <InfoBox label="Nhiệt độ" value={temperature !== null ? `${temperature} °C` : 'Đang tải...'} icon={tempIcon} />
        <InfoBox label="Độ ẩm" value={humidity !== null ? `${humidity} %` : 'Đang tải...'} icon={humiIcon} />
        <InfoBox label="Đèn" value={lightOn ? "ON" : "OFF"} iconOn={lightOnIcon} iconOff={lightOffIcon} onChange={handleToggleLight} />
        <InfoBox label="Tưới nước" value={""} icon={sprinkleOnIcon} buttonLabel="Kích hoạt" onButtonClick={handleSprinkleAction} />
      </div>
      {showIrrigationModal && (
        <div className="modal-overlay">
          <div className="modal-container" ref={irrigationModalRef}>
            <h2>Cài đặt tưới tiêu tự động</h2>
            <table className="irrigation-table">
              <thead>
                <tr>
                  <th>Chế độ tưới</th>
                  <th>Mô tả</th>
                  <th>Nhiệt độ</th>
                  <th>Độ ẩm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tự động hoàn toàn</td>
                  <td>Dựa vào nhiệt độ và độ ẩm đất, hệ thống tự đưa ra quyết định tưới nước cho cây.</td>
                  <td>
                    <input
                      type="number"
                      name="value_temp"
                      value={auto_temp}
                      min={10}
                      max={40}
                      onChange={(e) => setAutoTemp(e.target.value.toString())}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="value_humi"
                      value={auto_humi}
                      min={0}
                      max={100}
                      onChange={(e) => setAutoHumi(e.target.value.toString())}
                      required
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        const temp = parseInt(auto_temp, 10);
                        const humi = parseInt(auto_humi, 10);
                        if (isNaN(temp) || isNaN(humi)) {
                          toast.error("Vui lòng nhập đầy đủ nhiệt độ và độ ẩm!");
                          return;
                        }
                        if (temp < 10 || temp > 40) {
                          toast.error("Nhiệt độ phải nằm trong khoảng 10°C - 40°C!");
                          return;
                        }
                        if (humi < 0 || humi > 100) {
                          toast.error("Độ ẩm phải nằm trong khoảng 0% - 100%!");
                          return;
                        }
                        handleSelectIrrigationMode("auto", auto_temp, auto_humi);
                      }}
                    >
                      Tiến hành
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="modal-close-button" onClick={() => setShowIrrigationModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
      {showCalendar && (
        <div className="result-modal">
          <div className="modal-content" ref={calendarRef}>
            <span className="close" onClick={() => setShowCalendar(false)}>&times;</span>
            <h2>Chọn ngày</h2>
            <Calendar
              onChange={(date) => {
                setSelectedDate(date as Date);
                setShowCalendar(false);
              }}
              value={selectedDate}
              className="custom-calendar"
            />
          </div>
        </div>
      )}
      <div className="mrp-chart-section">
        <h2>Báo cáo cho 30 ngày gần nhất</h2>
        <div className="mrp-chart-buttons">
          <button
            className={`mrp-btn-temp ${chartType === 'temperature' ? 'active' : ''}`}
            onClick={() => setChartType('temperature')}
          >
            Nhiệt độ
          </button>
          <button
            className={`mrp-btn-humi ${chartType === 'humidity' ? 'active' : ''}`}
            onClick={() => setChartType('humidity')}
          >
            Độ ẩm
          </button>
        </div>
        <div className="mrp-chart-container">
          {chartType === 'temperature' ? (
            <LineChart width={800} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                width={60}
                tick={{ style: { textAnchor: 'middle', dominantBaseline: 'middle', fontSize: '14px' } }}
              />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Nhiệt độ (°C)" />
            </LineChart>
          ) : (
            <BarChart width={800} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                width={60}
                domain={[0, 100]}
                tick={{ style: { textAnchor: 'middle', dominantBaseline: 'middle', fontSize: '14px' } }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="humidity" fill="#387908" name="Độ ẩm (%)" />
            </BarChart>
          )}
        </div>
      </div>
      <div className="mrp-right-side">
        <div>
          <div className="mrp-image-box">
            <img src={`data:image/jpeg;base64,${imageUrl}`} alt="Hình ảnh" />
          </div>
          <button className="mrp-capture-button" onClick={handleCapture}>
            Phân tích
          </button>
          {isLoading && (
          <div className="loader-overlay">
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="loading-text">Đang phân tích...</div>
          </div>
          )}
          {showPlantStatus && (
            <div className="result-modal">
              <div className="modal-content" ref={plantStatusRef}>
                <span className="close" onClick={() => setShowPlantStatus(false)}>&times;</span>
                <h2>Kết quả phân tích</h2>
                <div className="modal-image">
                  <img src={`data:image/jpeg;base64,${imageUrl}`} alt="Ảnh vừa chụp" />
                </div>
                <div className="status-result">
                  <h3>Tình trạng cây:</h3>
                  <p>{plantStatus || "Đang phân tích..."}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorReportPage;
