const axios = require('axios');
const express = require('express');
const router = express.Router();

const BKU_ADDRESS = '0xE06814AA31667f5e0eFA7A9D86a0c4AC58bdB98d';
const ETHERSCAN_API_KEY = 'D8GMVC99C98CY8J3KMCWFPEIZWAIRG4FWY';

/* -------------------- Get ETH balance from users wallet ------------------- */
router.get('/get-ETH-balance', async (req, res) => {
  const address = req.query.address;

  try {
    // Get ETH balance
    const ethResponse = await axios.get(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );

    if (ethResponse.data.status === '1') {
      const ethBalanceInWei = ethResponse.data.result;
      const ethBalanceInEther = ethBalanceInWei / 1e18;

      res.status(200).json({
        status: true,
        message: `ETH balance for ${address}`,
        ethBalance: ethBalanceInEther,
        ethWeiBalance: ethBalanceInWei
      });
    } else {
      res.status(500).json({
        status: false,
        message: `Failed to get the ETH balance for user ${address}`,
        error: ethResponse.data.message,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

/* -------------------- Get BKU balance from users wallet ------------------- */

router.get('/get-BKU-balance', async (req, res) => {
  const address = req.query.address;

  try {
    // Get BKU token balance
    const tokenResponse = await axios.get(
      `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${BKU_ADDRESS}&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );

    if (tokenResponse.data.status === '1') {
      const bkuBalance = tokenResponse.data.result;

      res.status(200).json({
        status: true,
        message: `Token balance for ${address}`,
        bkuBalance: bkuBalance,
      });
    } else {
      res.status(500).json({
        status: false,
        message: `Failed to get the token balance for user ${address}`,
        error: tokenResponse.data.message,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */

// ! SEND TRANSACTIONS ROUTE

/* -------------------------------------------------------------------------- */




module.exports = router;
