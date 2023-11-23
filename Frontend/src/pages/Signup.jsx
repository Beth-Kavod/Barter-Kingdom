import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Web3, { TransactionRevertedWithoutReasonError } from 'web3';
import { URL, PORT } from '../../data/URL.json'
import Nav from '../components/Nav'
import Footer from '../components/Footer';

export default function Signup(props) {
  // MetaMask
  const [web3, setWeb3] = useState('');
  const [ethBalance, setEthBalance] = useState(0)
  const [bkuBalance, setBkuBalance] = useState(0)
  const [bkuContract, setBkuContract] = useState(null)
  const [walletAddress, setWalletAddress] = useState('')
  const navigate = useNavigate()
  // Tribes
  const tribes = [
    "Judah",
    "Issachar",
    "Zebulon",
    "Dan",
    "Naphtali",
    "Gad",
    "Reuben",
    "Simeon",
    "Levi",
    "Asher",
    "Joseph",
    "Benjamin"
  ]

  /* ------------------------------ Set user data ----------------------------- */

  const [tribe, setTribe] = useState()
  const [user, setUser] = useState({
    username: "",
    password: "",
    tribe: "",
    walletAddress: ""
  })

  const handleTribeChange = (event) => {
    setUser(prev => ({
      ...prev,
      tribe: event.target.value 
    }))

    setTribe(event.target.value)
  };

  const inputsHandler = (e) => {
    setUser(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  /* ------------------------- Connect MetaMask wallet ------------------------ */

  const connectWallet = (e) => {
    e.preventDefault()
    const loginMetaMask = async () => {
      let localWallet = JSON.parse(localStorage.getItem('wallet'))

      if (localWallet)  {
        setUser(prev => ({
          ...prev,
          walletAddress: localWallet.walletAddress
        }))
        setWalletAddress(localWallet.walletAddress)
      } 

      else if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          // Instantiate web3 with the current provider
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
  
          // Listen for changes in the connected accounts
          window.ethereum.on('accountsChanged', (accounts) => {
            setUser(prev => ({
              ...prev,
              walletAddress: accounts[0]
            }));
          });
  
          // Initial set of the wallet address
          const accounts = await web3Instance.eth.getAccounts();
          setUser(prev => ({
            ...prev,
            walletAddress: accounts[0]
          }));
          localStorage.setItem('wallet', JSON.stringify({ walletAddress: accounts[0] }));
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } else {
        const userWantsToGoToWebsite = window.confirm('MetaMask is required to make an account, \nDo you want to go to the MetaMask website?');
  
        if (userWantsToGoToWebsite) window.open('https://metamask.io/download/', '_blank')
      }
    };
  
    loginMetaMask();
  }

  /* -------------------------- Create a new user -------------------------- */

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${URL}:${PORT}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data.message)
      navigate('/login')
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  /* -------------------------------- DEV LOGS -------------------------------- */
  
  return (
    <>
      <Nav />

      <form style={{width: "400px"}} className="mx-auto p-4 bg-white rounded shadow-md">
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
            type="text"
            name="email"
            placeholder="Email"
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
        <div className="mb-4">
          <button
            onClick={connectWallet}
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Connect Wallet
          </button>
        </div>
        <h4 className="text-black">connected wallet</h4>
        <h4 className="text-black">{walletAddress}</h4>
        <div className="mb-4">
          <label htmlFor="tribeSelect" className="block text-sm font-medium text-gray-600">
            Select Tribe:
          </label>
          <select
            id="tribeSelect"
            value={tribe}
            onChange={handleTribeChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          >
            <option value="">Select One</option>
            {tribes.map((tribe, index) => (
              <option key={index} value={tribe}>
                {tribe}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <button
            type="submit"
            onClick={onSubmit}
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Submit
          </button>
        </div>
      </form>

      <Footer />
    </>
  )
}