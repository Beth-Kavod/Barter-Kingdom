import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Web3, { TransactionRevertedWithoutReasonError } from 'web3';
import { URL, PORT } from '../../data/URL.json'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Login() {
  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useState({
    username: "",
    password: ""
  })

  const inputsHandler = (e) => {
    setUserInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch(`${URL}:${PORT}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept": "*/*"
      },
      body: JSON.stringify(userInfo),
      credentials: 'include'  // Include credentials (cookies)
    })  
    
    const data = await response.json()

    if (response.status === 403) {
      window.alert('bad stuff, no good for login')
      return false
    } else if (response.status === 200) {
      console.log('very good, goood boy. you are now logged on')
      navigate('/')
      return true
    }

  }


  return (
    <>
      <Nav />
      <h1>Login</h1>
      {/* i dont think it is necessary to have this page */}
      {/* <button onClick={connectWallet}></button> */}

      <form action="">
        <div className="mb-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={inputsHandler}
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={inputsHandler}
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <button onClick={onSubmit}>Submit</button>
      </form>
      <Footer />
    </>
  )
}