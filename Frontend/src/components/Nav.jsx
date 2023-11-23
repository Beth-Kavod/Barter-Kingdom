import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Web3, { TransactionRevertedWithoutReasonError } from 'web3';
import axios from 'axios'
import BKU_ABI from '../../data/BKU-abi.json'

const Nav = () => {
  const [web3, setWeb3] = useState('');
  const [Wallet_Address, setWallet_Address]  = useState('')
  const [ethBalance, setEthBalance] = useState(0)
  const [bkuBalance, setBkuBalance] = useState(0)
  const [bkuContract, setBkuContract] = useState(null)

  const BKU_ADDRESS = '0xE06814AA31667f5e0eFA7A9D86a0c4AC58bdB98d'

  /* ------------------------ User MetaMask connection ------------------------ */

  const connectWallet = () => {
    const loginMetaMask = async () => {
      let localWallet = JSON.parse(localStorage.getItem('wallet'))

      if (localWallet) setWallet_Address(localWallet.walletAddress) 

      else if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          // Instantiate web3 with the current provider
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Listen for changes in the connected accounts
          window.ethereum.on('accountsChanged', (accounts) => {
            setWallet_Address(accounts[0]);
            localStorage.setItem('wallet', JSON.stringify({ walletAddress: accounts[0] }));
          });

          // Initial set of the wallet address to localStorage
          const accounts = await web3Instance.eth.getAccounts();
          setWallet_Address(accounts[0]);
          localStorage.setItem('wallet', JSON.stringify({ walletAddress: accounts[0] }));

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
  /* -------------------------------- Dev LOGS -------------------------------- */

  /* useEffect(() => {
    console.log(`ethBalance: ${ethBalance}`)
    console.log(`bkuBalance: ${bkuBalance}`)
    console.log(`Wallet_Address: ${Wallet_Address}`)
    console.log(bkuContract)
  }, [bkuBalance]) */

  useEffect(() => {
    connectWallet()
    console.log(Wallet_Address)
  }, [Wallet_Address])

  return (
    <div className="w-screen flex justify-around">
      <Link to='/'>Home</Link>
      <Link to='/signup'>Sign Up</Link>
      <Link to='/login'>Login</Link>
      <Link to='/Tribes'>Tribes</Link>
      <Link to='/Profile'>Profile</Link>
      <button onClick={connectWallet}>connect wallet</button>
    </div>
  );
};

export default Nav;
