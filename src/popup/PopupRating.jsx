import React, { useEffect, useState } from "react";
import axios from "axios";
import StarRatings from "react-star-ratings";

const DELAY_MINUTES = 30; // delay dalam menit

const PopupRating = ({ userId }) => {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Cek apakah user sudah isi rating atau delay
  useEffect(() => {
    if (!userId) return;

    // Cek waktu terakhir popup ditutup/diisi
    const lastHide = localStorage.getItem(`popupRatingLastHide_${userId}`);
    const now = Date.now();
    if (lastHide && now - parseInt(lastHide, 10) < DELAY_MINUTES * 60 * 1000) {
      setShow(false);
      return;
    }

    // Cek ke backend apakah sudah pernah rating
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
      setShow(false);
      localStorage.setItem(`popupRatingLastHide_${userId}`, Date.now().toString());
      alert("Terima kasih atas ratingnya!");
    } catch (err) {
      alert("Gagal mengirim rating!");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(`popupRatingLastHide_${userId}`, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 24, borderRadius: 16, minWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <h3 style={{ fontWeight: 800, fontSize: 22, color: "#2563eb", marginBottom: 12, textAlign: "center" }}>
          Beri Rating Aplikasi
        </h3>
        <StarRatings
          rating={rating}
          starRatedColor="#ffd700"
          changeRating={setRating}
          numberOfStars={5}
          starDimension="32px"
          starSpacing="4px"
        />
        <textarea
          placeholder="Tulis feedback (opsional)"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          style={{
            width: "100%",
            marginTop: 16,
            minHeight: 60,
            borderRadius: 10,
            border: "1px solid #dbeafe",
            padding: 10,
            fontSize: 16,
            background: "#f1f5fd"
          }}
        />
        <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            type="submit"
            disabled={loading || rating === 0}
            style={{
              padding: "10px 28px",
              borderRadius: 999,
              background: "linear-gradient(90deg,#2563eb,#38bdf8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              boxShadow: "0 2px 8px #2563eb22",
              cursor: loading || rating === 0 ? "not-allowed" : "pointer",
              opacity: loading || rating === 0 ? 0.7 : 1
            }}
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "10px 28px",
              borderRadius: 999,
              background: "#e0e7ef",
              color: "#2563eb",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              boxShadow: "0 2px 8px #2563eb11",
              cursor: "pointer"
            }}
          >
            Nanti saja
          </button>
        </div>
      </form>
    </div>
  );
};

export default PopupRating;