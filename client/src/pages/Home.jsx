import React from "react";
import Hero from "../components/Hero";
import FeaturedDestination from "../components/FeaturedDestination";
import ExclusiveOffers from "../components/ExclusiveOffers";
import Testimonial from "../components/Testimonial";
import NewLatter from "../components/NewLatter";

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedDestination/>
      <ExclusiveOffers/>
      <Testimonial/>
      <NewLatter/>
    </>
  );
};

export default Home;
