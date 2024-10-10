// ReviewContext.js
import React, { createContext, useState } from 'react';

export const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [liveReviews, setLiveReviews] = useState([]);

  return (
    <ReviewContext.Provider value={{ liveReviews, setLiveReviews }}>
      {children}
    </ReviewContext.Provider>
  );
};
