// import "../assets/css/output.css";
import Navbar from "../components/Nav";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Navbar />
      <div>
        <h1 className="text-center">Home</h1>
      </div>
      <Footer />
    </>
  )
}
