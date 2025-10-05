import React from 'react'

function LiquidCard() {
  return (
    
        <div className='flex w-[100%] max-height-[10vh] ml-3 mr-3 p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-101 hover:transition-all duration-300 '>
            <div className='flex flex-col '>
              <h1 className='text-white text-xl font-bold mb-2'>Card Head</h1>

            <p className='text-white/80 mb-4'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Totam dolorum magnam eaque sapiente molestias aut repudiandae, dicta ipsum recusandae voluptas similique earum, voluptate incidunt inventore! Autem a debitis incidunt culpa.</p>
            
            <button className='w-60 p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-103 hover:transition-all duration-300'><p className='text-white/80'>Update/View</p></button>
            </div>

            <div>
              <img className='w-fit' src="image.png" alt="" />
            </div>
        </div>
        
    // </div>
  )
}

export default LiquidCard