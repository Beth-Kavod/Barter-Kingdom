import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import Web3, { TransactionRevertedWithoutReasonError } from 'web3';

/* ---------------------------------- Data ---------------------------------- */

import BKU_ABI from '../data/BKU-abi.json'
import { URL, PORT } from '../data/URL'

/* ---------------------------------- Pages --------------------------------- */

import Home from './pages/Home' 
import Profile from './pages/Profile' 
import Signup from './pages/Signup'
import Login from './pages/Login'
import Tribes from './pages/Tribes'
import SingleTribe from './pages/SingleTribe';

function App() {
  /* ----------------------------- Web3 variables ----------------------------- */
  
  const BKU_ADDRESS = '0xE06814AA31667f5e0eFA7A9D86a0c4AC58bdB98d'
  const [web3, setWeb3] = useState('');
  const [Wallet_Address, setWallet_Address]  = useState('')
  const [bkuContract, setBkuContract] = useState(null)
  const [walletBalance, setWalletBalance] = useState({
    BKU: 0,
    ETH: 0
  })
  
  /* ----------------------------- User variables ----------------------------- */

  const [cookies, setCookies, removeCookie] = useCookies(['user'])
  const [user, setUser] = useState()

  /* ------------------------ User MetaMask connection ------------------------ */

  const connectWallet = () => {
    const loginMetaMask = async () => {
      if (user) setWallet_Address(user.walletAddress) 

      else if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          // Instantiate web3 with the current provider
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Listen for changes in the connected accounts
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
              // Handle wallet disconnect here
              setWallet_Address(null);
              // Additional logic for wallet disconnect...
            } else {
              setWallet_Address(accounts[0]);
            }
          });  

          // Listen for disconnect event
          window.ethereum.on('disconnect', (error) => {
            if (error) {
              console.error('Error disconnecting from MetaMask:', error);
            } else {
              console.log('Disconnected wallet')
              setWallet_Address(null);
              // Additional logic for wallet disconnect...
            }
          })

          // Initial set of the wallet address to localStorage
          const accounts = await web3Instance.eth.getAccounts();
          setWallet_Address(accounts[0]);

          const tokenContractInstance = new web3Instance.eth.Contract(
            BKU_ABI,
            BKU_ADDRESS
          );

          setBkuContract(tokenContractInstance);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } 
      // if the user is not logged in and does'nt have MetaMask 
      else {
        const userWantsToGoToWebsite = window.confirm('MetaMask is required to make an account, \nDo you want to go to the MetaMask website?');
  
        if (userWantsToGoToWebsite) window.open('https://metamask.io/download/', '_blank')
      }
    }

    loginMetaMask();
  }

  /* --------------------------- Logout of MetaMask --------------------------- */

  const logout = () => {
    const disconnectWallet = async () => {  
      try {
        // Disconnect MetaMask
        if (window.ethereum) {
          // await window.ethereum.disconnect();
          // console.log(window.ethereum)
        }
    
        // Perform your logout logic on the server
        const response = await fetch(`${URL}:${PORT}/auth/logout`, {
          method: 'POST',
          headers: {
            // Include any additional headers if needed
          },
          credentials: 'include'
        });
    
        const data = await response.json();
        console.log(data);
    
        setWallet_Address(null);
        setUser()
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    disconnectWallet()
  };

  /* ----------------------- Get userAuthID from cookies ---------------------- */

  useEffect(() => {
    const verifyCookie = async () => {
      if (cookies.user && cookies.user !== undefined) {
        // Fetch authMiddleware for user
        const response = await fetch(`${URL}:${PORT}/`, {
          method: 'POST',
          credentials: 'include'
        })

        const data = await response.json()
        setUser(data.user)
      }
    }

    verifyCookie()
  }, [cookies, removeCookie])

/* -------------------------------- DEV LOGS -------------------------------- */
/* useEffect(() => {
  console.log(`ethBalance: ${ethBalance}`)
  console.log(`bkuBalance: ${bkuBalance}`)
  console.log(`Wallet_Address: ${Wallet_Address}`)
  console.log(bkuContract)
}, [bkuBalance]) */

/* useEffect(() => {
  async function fetchUser() {
    await getUser()
  }
  fetchUser()
}, []) */


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home props={{user}}/>} />
        <Route path="/login" element={<Login connectWallet={connectWallet} logout={logout} user={user} wallet={{walletBalance, Wallet_Address}} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tribes" element={<Tribes />} />
        <Route path="/tribes/:Tribe" element={<SingleTribe />} />
        <Route path="/profile/:username" element={<Profile props={{user}} />} />
        {/* <Route path="/accounts/create" element={<CreateAccountPage />} />
        <Route path="/accounts/profile/:username" element={<ProfilePage />} />
        <Route path="/posts" element={<ViewPosts />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/posts/create" element={<CreatePostPage />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App
