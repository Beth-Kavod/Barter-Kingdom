import { useState, useEffect } from 'react'

const [web3, setWeb3] = useState('');
const [Wallet_Address, setWallet_Address]  = useState('')
const [ethBalance, setEthBalance] = useState(0)
const [bkuBalance, setBkuBalance] = useState(0)
const [bkuContract, setBkuContract] = useState(null)

const BKU_ADDRESS = '0xE06814AA31667f5e0eFA7A9D86a0c4AC58bdB98d'

/* ------------------------ User MetaMask connection ------------------------ */

const connectWallet = () => {
  const loginMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Instantiate web3 with the current provider
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Listen for changes in the connected accounts
        window.ethereum.on('accountsChanged', (accounts) => {
          setWallet_Address(accounts[0]);
        });

        // Initial set of the wallet address
        const accounts = await web3Instance.eth.getAccounts();
        setWallet_Address(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);

        const tokenContractInstance = new web3Instance.eth.Contract(
          BKU_ABI,
          BKU_ADDRESS
        );

        setBkuContract(tokenContractInstance);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.warn('MetaMask not found!');
    }
  };

  loginMetaMask();
}

/* ------------------------- Add BKU token to wallet ------------------------ */

const addBKU = async () => {
  if (window.ethereum) {
    try {
      // Request to add BKU token to Metamask
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: BKU_ADDRESS,
            symbol: 'BKU',
            decimals: 4,
            image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpiximus.net%2Fmedia2%2F51392%2Fawkward-stock-photos-31.jpg&f=1&nofb=1&ipt=e22ee5eb54220a98ef944a25fa0f288b3694ca9513049cbece389cd68f73b96c&ipo=images',
          },
        },
      });

      console.log('Token added successfully');
    } catch (error) {
      console.error('Error adding token:', error);
    }
  } else {
    console.error('Metamask not detected');
  }
}

/* ---------------------------- Send Transaction ---------------------------- */

const sendBKU = async (recipientAddress, amount) => {
  if (!web3 || !bkuContract) {
    console.error('Web3 or token contract not initialized');
    return;
  }

  try {
    // Converts the amount out of "Grain"
    // for the time being "Grain" is the name of the smallest denomination
    amount *= 10000;

    // Call the 'transfer' function of the token contract
    const transaction = await bkuContract.methods.transfer(recipientAddress, amount).send({
      from: Wallet_Address,
    });

    console.log('Token transfer transaction:', transaction);
  } catch (error) {
    console.error('Error sending token:', error);
  }
};

/* ---------------------- Check user ETH & BKU balance ---------------------- */

const checkBalance = async () => {
  axios.get(`http://localhost:4000/metamask/get-ETH-balance?address=${Wallet_Address}`)
  .then(result => {
    setEthBalance(result.data.ethBalance)
  })

  axios.get(`http://localhost:4000/metamask/get-BKU-balance?address=${Wallet_Address}`)
  .then(result => {
    setBkuBalance(result.data.bkuBalance)
  })
};

/* -------------------------------------------------------------------------- */

export { checkBalance, addBKU, sendBKU, connectWallet }