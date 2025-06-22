import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaUserAlt, FaRegSmileBeam, FaRegMeh, FaRegFrown, FaRegAngry } from 'react-icons/fa';
import Sidebar from './Sidebar';

const RatingPage = () => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [starCounts, setStarCounts] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/rating')
      .then(res => {
        setRatings(res.data.ratings);
        calculateAverageRating(res.data.ratings);
        calculateStarCounts(res.data.ratings);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
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
      <FaStar 
        key={i} 
        className={`${i < count ? 'text-yellow-400' : 'text-gray-300'} text-lg`} 
      />
    ));
  };

  const getRatingFace = (rating) => {
    if (rating >= 4.5) return <FaRegSmileBeam className="text-green-500 text-3xl" />;
    if (rating >= 3.5) return <FaRegSmileBeam className="text-green-400 text-3xl" />;
    if (rating >= 2.5) return <FaRegMeh className="text-yellow-500 text-3xl" />;
    if (rating >= 1.5) return <FaRegFrown className="text-orange-500 text-3xl" />;
    return <FaRegAngry className="text-red-500 text-3xl" />;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Great';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4 md:px-6">
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-500 text-xl" />
              <h1 className="text-xl font-bold text-gray-800">Product Ratings</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <>
              {/* Rating Summary */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl shadow-lg p-6 text-white mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex flex-col items-center mb-4 md:mb-0">
                    <div className="text-5xl font-bold mb-1">{averageRating}</div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`${i < Math.floor(averageRating) ? 'text-white' : 'text-yellow-100'} text-lg`} 
                        />
                      ))}
                    </div>
                    <div className="text-lg font-medium">{getRatingText(parseFloat(averageRating))}</div>
                  </div>
                  
                  <div className="hidden md:block">
                    {getRatingFace(parseFloat(averageRating))}
                  </div>
                  
                  <div className="text-center md:text-right">
                    <div className="text-2xl font-bold">{ratings.length}</div>
                    <div className="text-lg">Total Ratings</div>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Rating Distribution</h2>
                
                {[5, 4, 3, 2, 1].map((stars) => {
                  const percentage = ratings.length > 0 
                    ? (starCounts[stars] / ratings.length) * 100 
                    : 0;
                  
                  return (
                    <div key={stars} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center w-16">
                          <span className="text-gray-700 mr-2">{stars}</span>
                          <FaStar className="text-yellow-400" />
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm w-16 text-right">
                          {starCounts[stars]} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User Reviews */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">User Reviews</h2>
                
                {ratings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                    <p className="text-gray-500">Be the first to leave a review!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ratings.map(rating => (
                      <div 
                        key={rating.id} 
                        className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-start mb-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUserAlt className="text-blue-500" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <h3 className="font-bold text-gray-800">{rating.user.name}</h3>
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {renderStars(rating.rating)}
                              </div>
                              <span className={`text-sm font-semibold ${getRatingColor(rating.rating)}`}>
                                {rating.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700">
                            {rating.feedback || 'No comments provided.'}
                          </p>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          {new Date(rating.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingPage;