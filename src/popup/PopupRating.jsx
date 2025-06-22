import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaTimes, FaPaperPlane, FaClock, FaSmile, FaHeart } from "react-icons/fa";

const DELAY_MINUTES = 30; // delay dalam menit

const PopupRating = ({ userId }) => {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const lastHide = localStorage.getItem(`popupRatingLastHide_${userId}`);
    const now = Date.now();
    if (lastHide && now - parseInt(lastHide, 10) < DELAY_MINUTES * 60 * 1000) {
      setShow(false);
      return;
    }

    axios.post("http://localhost:8000/api/rating/check", { user_id: userId }).then(res => {
      if (!res.data.hasRated) setShow(true);
    });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/rating", {
        user_id: userId,
        rating,
        feedback,
      });
      
      // Simpan dan tutup popup
      setShow(false);
      localStorage.setItem(`popupRatingLastHide_${userId}`, Date.now().toString());
      
      // Tampilkan sweet alert sukses
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (err) {
      console.error("Gagal mengirim rating:", err);
      // Tampilkan sweet alert error
      setShowSuccess(false);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(`popupRatingLastHide_${userId}`, Date.now().toString());
  };

  return (
    <>
      {/* Popup Rating */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", 
              top: 0, 
              left: 0, 
              width: "100vw", 
              height: "100vh",
              background: "rgba(0,0,0,0.7)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              zIndex: 9999,
              backdropFilter: "blur(5px)"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
              style={{ 
                position: "relative",
                background: "linear-gradient(135deg, #ffffff, #f0f7ff)",
                padding: "32px",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "420px",
                boxShadow: "0 20px 50px rgba(37, 99, 235, 0.3)",
                border: "1px solid rgba(37, 99, 235, 0.1)"
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(37, 99, 235, 0.05)",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#2563eb",
                  fontSize: "18px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(37, 99, 235, 0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(37, 99, 235, 0.05)"}
              >
                <FaTimes />
              </button>
              
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)"
                }}>
                  <FaStar style={{ fontSize: "36px", color: "#ffd700" }} />
                </div>
                
                <h3 style={{ 
                  fontWeight: 700, 
                  fontSize: "24px", 
                  color: "#1e293b", 
                  marginBottom: "8px",
                  background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Bagaimana Pengalaman Anda?
                </h3>
                
                <p style={{ 
                  fontSize: "16px", 
                  color: "#64748b", 
                  lineHeight: 1.5,
                  maxWidth: "320px",
                  margin: "0 auto"
                }}>
                  Berikan penilaian Anda untuk membantu kami meningkatkan layanan
                </p>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                margin: "24px 0"
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "40px",
                      padding: "0 6px",
                      color: star <= (hoveredStar || rating) ? "#ffd700" : "#e2e8f0",
                      transition: "transform 0.2s ease, color 0.2s ease",
                      transform: star <= (hoveredStar || rating) ? "scale(1.2)" : "scale(1)"
                    }}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
              
              <div style={{ marginBottom: "24px" }}>
                <textarea
                  placeholder="Tuliskan feedback Anda (opsional)"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  style={{
                    width: "100%",
                    height: "120px",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "16px",
                    resize: "none",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "#2563eb";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.05)";
                  }}
                />
              </div>
              
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                justifyContent: "center"
              }}>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || rating === 0}
                  style={{
                    flex: 1,
                    padding: "16px 24px",
                    borderRadius: "14px",
                    background: rating === 0 
                      ? "#e2e8f0" 
                      : "linear-gradient(90deg, #2563eb, #3b82f6)",
                    color: rating === 0 ? "#94a3b8" : "#ffffff",
                    fontWeight: 600,
                    fontSize: "16px",
                    border: "none",
                    boxShadow: rating === 0 
                      ? "none" 
                      : "0 6px 16px rgba(37, 99, 235, 0.3)",
                    cursor: loading || rating === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease, transform 0.1s ease"
                  }}
                  onMouseEnter={e => rating > 0 && (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={e => rating > 0 && (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Mengirim...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Kirim Penilaian
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: "16px 24px",
                    borderRadius: "14px",
                    background: "#f1f5f9",
                    color: "#334155",
                    fontWeight: 600,
                    fontSize: "16px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease, transform 0.1s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <FaClock /> Nanti Saja
                </button>
              </div>
              
              <p style={{ 
                textAlign: "center", 
                fontSize: "12px", 
                color: "#94a3b8", 
                marginTop: "20px"
              }}>
                Anda dapat memberikan penilaian kembali dalam {DELAY_MINUTES} menit
              </p>
            </motion.div>
            
            <style jsx>{`
              .spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 3px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
              }
              
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sweet Alert Success */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 10000,
              background: "linear-gradient(135deg, #10b981, #34d399)",
              color: "white",
              padding: "20px 30px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              maxWidth: "400px"
            }}
          >
            <div style={{
              width: "50px",
              height: "50px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              <FaSmile />
            </div>
            
            <div>
              <h4 style={{ 
                fontWeight: 700, 
                fontSize: "18px", 
                marginBottom: "4px"
              }}>
                Terima Kasih!
              </h4>
              <p style={{ 
                fontSize: "14px", 
                opacity: 0.9,
                maxWidth: "300px"
              }}>
                Penilaian Anda sangat berarti bagi kami 💖
              </p>
            </div>
            
            <div style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "0 0 16px 16px",
              overflow: "hidden"
            }}>
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3, ease: "linear" }}
                style={{
                  height: "100%",
                  background: "white"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PopupRating;