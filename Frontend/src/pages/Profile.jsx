// import "../assets/css/output.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { URL, PORT } from '../../data/URL'

export default function Profile({user}) {
  const { username } = useParams()
  const [userProfile, setUserProfile] = useState()
  // const [avatar, setAvatar] = useState(user.avatar)
  const [userAuthID, setUserAuthID] = useState()
  console.log(user)
  /* ------------------------------ Get user data ----------------------------- */

  const getUser = async () => {                                //! TEMP NAME     
    const userData = await fetch(`${URL}:${PORT}/users/profile/${username}/* ?userID=${userAuthID} */`)
    const data = await userData.json()

    setUserProfile(data.user)

  }

  const updateAvatar = async (event) => {
    const imageFile = event.target.files[0];
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "Avatar");

    // ! ADD FILE NAME LATER
    // const customFileName = `${user.username}-${Date.now().toString}-${user.createdAt}`

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/djez6nvh7/image/upload/`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    // Ensure success
    if (response.status === 200) {
        const url = data.secure_url;
        const username = user?.username;

        setAvatar(url);

        // Update avatar in the backend mongo-db
        fetch(`http://${URL}:${PORT}/users/update-avatar?userID=${userAuthID}`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, url }),
        });
    } else {
        console.error("Image response or user does not exist.");
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      await getUser()
    }
    fetchUser()
  })

  return (
    <>
      <Nav />
      <h1>Profile of {username}</h1>
      <div>
        <h4>Upload profile photo</h4>
        <input
          type="file"
          accept="image/*"
          className="text-xs py-3"
          onChange={updateAvatar}
        />

        { 
          user && userProfile ?
            <img src={userProfile.avatar} alt="Profile Photo" style={{width: '100px', height: '100px'}}/>
            : 
            ""
        }      
      </div>
      <Footer />
    </>
  )
}
