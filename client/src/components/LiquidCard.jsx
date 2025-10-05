import React from 'react'

function LiquidCard() {
  return (
    <div className="flex w-full h-52 ml-3 mr-3 p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-[1.02] transition-all duration-300">

      <div className="flex flex-col justify-between w-3/4 pr-6 overflow-hidden">
        <div>
          <h1 className="text-white text-xl font-bold mb-2 truncate">Card Head</h1>
          <p className="text-white/80 text-sm line-clamp-3">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Totam dolorum magnam eaque sapiente molestias aut repudiandae, dicta ipsum recusandae voluptas similique earum, voluptate incidunt inventore!
          </p>
        </div>

        <button className="w-40 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-105 transition-all duration-300">
          <p className="text-white/80 text-sm">Update / View</p>
        </button>
      </div>

      <div className="w-1/4 flex justify-center items-center">
        <img
          src="image.png"
          alt="Card illustration"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  )
}

export default LiquidCard
