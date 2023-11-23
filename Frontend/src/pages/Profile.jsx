// import "../assets/css/output.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { URL, PORT } from '../../data/URL'

export default function Profile(props) {
  const [userAuthID, setUserAuthID] = useState('')
  const { username } = useParams()
  const [avatar, setAvatar] = useState('')
  const [user, setUser] = useState(props.user)

  /* const getCookies = async () => {
    const response = await fetch(`${URL}:${PORT}/users/protected`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'httpOnly': true
      },
      credentials: 'include'
    })
  
    if (!response.ok) {
      console.log(`Error: ${response.status} - ${response.statusText}`);
      setUserAuthID('')
      return false
    }
    
    const data = await response.json()
  
    setUserAuthID(data.userAuthID)
  } */

  /* const getUser = async () => {
    const user = await fetch(`${URL}:${PORT}/users/profile/${username}?userID=${userAuthID}`)
    const data = await user.json()

    setUser(data.user)

    await getCookies()

  } */

  const updateAvatar = async (event) => {
    const imageFile = event.target.files[0];
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "Avatar");

    // ! ADD FILE NAME LATER
    const customFileName = `${user.username}-${Date.now().toString}-${user.createdAt}`

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
        fetch(`http://localhost:4000/users/update-avatar?userID=${userAuthID}`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, url }),
        });
    } else {
        console.error("Image response or user does not exist.");
    }
  }

  /* useEffect(() => {
    getUser()
  }, [avatar]) */

  return (
    <>
      <Nav />
      <h1>Profile of {username}</h1>
      <div>
        <button onClick={() => getCookies()}>get cookie</button>
        <h4>Upload profile photo</h4>
        <input
          type="file"
          accept="image/*"
          className="text-xs py-3"
          onChange={updateAvatar}
        />

        { 
          user && user.avatar ?
            <img src={user.avatar} alt="Profile Photo" style={{width: '100px', height: '100px'}}/>
            : 
            ""
        }      
      </div>
      <Footer />
    </>
  )
}
