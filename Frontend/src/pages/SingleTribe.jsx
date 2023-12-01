import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// Gift source: https://christianchat.com/testimonies/revelation-12-tribes-of-israel-spiritual-gifts.22185/
// Stone source: https://johnpratt.com/items/docs/lds/meridian/2005/12stones.html#2.2
import tribeData from '../../data/tribeData.json'

export default function SingleTribe({ user }) {
  const { Tribe } = useParams();
  const getTribe = tribeData.find(tribe => tribe.name === Tribe)
  

  return (
    <>
      <Nav  user={user} />
      <div>
        <h1>Tribe: {Tribe}</h1>
        <h1>Gift: {getTribe.gift}</h1>
        <h1>Gemstone: {getTribe.gemstone}</h1>
        <h1>Color: {getTribe.color} 
          <div 
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              backgroundColor: getTribe.color,
              marginLeft: '10px',
            }}
          />
        </h1>
      </div>
      <Footer />
    </>
  );
}