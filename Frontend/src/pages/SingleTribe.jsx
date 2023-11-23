import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import Nav from '../components/Nav'

export default function SingleTribe(tribe) {
  const { Tribe } = useParams();

  return (
    <>
      <Nav />
      <div>
        <h2>Tribe: {Tribe}</h2>
        {/* Your component logic here */}
      </div>
    </>
  );
}