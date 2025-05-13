import React from "react";
import assets from "../assets/assets";

const StarRating = ({ rating = 4 }) => {
  return (
    <>
      {Array(5)
        .fill("")
        .map((_, index) => (
          <img
            src={
              rating > index ? assets.starIconFilled : assets.starIconOutlined
            }
            alt="starIcon"
            className="h-4.5 w-4.5"
            key={index}
          />
        ))}
    </>
  );
};

export default StarRating;

