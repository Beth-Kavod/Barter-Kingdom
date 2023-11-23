// import "../assets/css/output.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function Home(props) {
  const { username } = useParams()
  return (
    <>
      <Nav />
      <h1>Profile of {username}</h1>
      <Footer />
    </>
  )
}
