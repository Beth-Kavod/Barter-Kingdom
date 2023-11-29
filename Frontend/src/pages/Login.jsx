import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Web3, { TransactionRevertedWithoutReasonError } from 'web3';
import { URL, PORT } from '../../data/URL.json'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const Login = ({ connectWallet, logout, user, wallet }) => {
  const navigate = useNavigate()
  console.log(`Login props`)
  console.log(wallet)
  const [userCredentials, setUserCredentials] = useState({
    username: "",
    password: ""
  })

  const inputsHandler = (e) => {
    setUserCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch(`${URL}:${PORT}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept": "*/*"
      },
      body: JSON.stringify(userCredentials),
      credentials: 'include'  // Include credentials (cookies)
    })  
    
    const data = await response.json()

    if (data.success) {
      console.log('very good, goood boy. you are now logged on')
      navigate('/')
      return true
    } else if (response.status === 401) {
      window.alert('bad stuff, no good for login')
      return false
    } else if (response.status === 500) {
      window.alert(`Something broke 💀, error: ${data.message}`)
    } 
  }


  return (
    <>
      <Nav logout={logout} user={user} />
      <button onClick={logout}>Logout</button>
      <h1>Login</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <h4>Wallet Address: {}</h4>
      {/* <button onClick={logout}>Logout</button> */}

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


export default Login