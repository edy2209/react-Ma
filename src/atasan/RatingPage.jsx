import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import Sidebar from './Sidebar';

const RatingPage = () => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [starCounts, setStarCounts] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    axios.get('http://localhost:8000/api/rating')
      .then(res => {
        setRatings(res.data.ratings);
        calculateAverageRating(res.data.ratings);
        calculateStarCounts(res.data.ratings);
      })
      .catch(err => console.error(err));
  }, []);

  const calculateAverageRating = (ratings) => {
    const total = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (total / ratings.length) || 0;
    setAverageRating(average.toFixed(1));
  };

  const calculateStarCounts = (ratings) => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      counts[rating.rating] = (counts[rating.rating] || 0) + 1;
    });
    setStarCounts(counts);
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < count ? 'text-yellow-400' : 'text-gray-300'} />
    ));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        <h2 className="text-3xl font-bold mb-6">Product Ratings</h2>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold">Rata-rata skor produk: {averageRating} / 5</h3>
          <p className="text-gray-500">{ratings.length} rating</p>
          <h4 className="font-semibold mt-4">Jumlah bintang:</h4>
          <p>⭐⭐⭐⭐⭐: {starCounts[5]}</p>
          <p>⭐⭐⭐⭐: {starCounts[4]}</p>
          <p>⭐⭐⭐: {starCounts[3]}</p>
          <p>⭐⭐: {starCounts[2]}</p>
          <p>⭐: {starCounts[1]}</p>
        </div>

        <h3 className="text-lg font-semibold mb-4">Ulasan Pengguna:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ratings.map(rating => (
            <div key={rating.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{rating.user.name}</h3>
                <div className="flex">{renderStars(rating.rating)}</div>
              </div>
              <p className="text-gray-700 mb-2">{rating.feedback || 'No comments.'}</p>
              <p className="text-sm text-gray-400 mt-2">Submitted on {new Date(rating.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {ratings.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No ratings found.</div>
        )}
      </div>
    </div>
  );
};

export default RatingPage;
