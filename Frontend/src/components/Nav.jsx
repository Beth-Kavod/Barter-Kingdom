import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { URL, PORT } from '../../data/URL'


const Nav = ({ logout, user }) => {
  /* useEffect(() => {
    connectWallet()
    getUser()
  }, [user]) */

  const disconnectWallet = async () => {
    await logout()
    
  }


  return (
    <div className="w-screen flex justify-around">
      <Link to='/'>Home</Link>
      <Link to='/signup'>Sign Up</Link>
      <Link to='/login'>Login</Link>
      <Link to='/tribes'>Tribes</Link>
      { user ? <Link to={`/profile/${user.username}`}>{user.username} Profile</Link> : null}
      <button onClick={disconnectWallet}>Logout</button>
      {/* <button onClick={getCookies}>Get cookies</button> */}
    </div>
  );
};

export default Nav;
