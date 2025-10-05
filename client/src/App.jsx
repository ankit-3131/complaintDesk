import React, { Children, useEffect, useState,useContext } from 'react'
import './index.css'
import LiquidCard from './components/LiquidCard';
import {useNavigate} from 'react-router-dom'

import toast from 'react-hot-toast';
function App() {
  
  return (
    <>
    <div className='bg-black'>
      <button className='min-width-50 p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-103 hover:transition-all duration-300'><p className='text-white/80'>CREATE TICKET</p></button>
      <div className=' grid gap-3 p-6 items-center justify-center min-h-screen'>
        {
          Array.from({length:10}, (_, i)=>i+1).map((_,index) => (
            <LiquidCard/>
            )
          )
        }
      </div>
    </div>
    </>
  )
}

export default App