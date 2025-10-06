import React from 'react';


function LiquidCard({ title, description, imageUrl, onClick }) {
  return (
    <div
      className="flex w-full h-52 ml-3 mr-3 p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col justify-between w-3/4 pr-6 overflow-hidden">
        <div>
          <h1 className="text-white text-xl font-bold mb-2 truncate">{title}</h1>
          <p className="text-white/80 text-sm line-clamp-3">{description}</p>
        </div>

        <button
          onClick={onClick}
          className="w-40 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:border-[#FF4040]/50 transition-all duration-300"
        >
          <p className="text-white/80 text-sm">Update / View</p>
        </button>
      </div>

      <div className="w-1/4 h-full rounded-lg overflow-hidden">
        <img
          src={imageUrl || "https://via.placeholder.com/150"}
          alt="Card illustration"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
}

export default LiquidCard;
