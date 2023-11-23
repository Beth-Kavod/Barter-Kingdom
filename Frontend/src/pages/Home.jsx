// import "../assets/css/output.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { URL, PORT } from '../../data/URL'
export default function Home() {

  
  return (
    <>
      <Nav />
      <div>
        <h1 className="text-center">Home</h1>
        {/* <button onClick={getCookie}>Get cookie</button> */}
      </div>
      <Footer />
    </>
  )
}
