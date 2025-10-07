import React from 'react';


function LiquidCard({ title, description, description2, imageUrl, onClick, role, ticket }) {
  const handleEdit = () => {
    console.log('Edit ticket', ticket?._id);
  };

  const handleAddNote = () => {
    console.log('Add note to', ticket?._id);
  };

  const handleMarkDone = () => {
    console.log('Mark done', ticket?._id);
  };

  return (
    <div
      className="flex w-full h-52 ml-3 mr-3 p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col justify-between w-3/4 pr-6 overflow-hidden">
        <div>
          <h1 className="text-white text-xl font-bold mb-2 truncate">{title}</h1>
          <p className="text-white/80 text-sm line-clamp-3">{description2}</p>
          <hr />
          <p className="text-white/80 text-sm line-clamp-3">{description}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClick}
            className="w-40 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:border-[#FF4040]/50 transition-all duration-300"
          >
            <p className="text-white/80 text-sm">Update / View</p>
          </button>

          {role === 'Staff' && (
            <div className="flex gap-2">
              <button onClick={handleEdit} className="px-3 py-2 rounded-lg bg-yellow-600 text-white">Edit</button>
              <button onClick={handleAddNote} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Add Note</button>
              <button onClick={handleMarkDone} className="px-3 py-2 rounded-lg bg-green-600 text-white">Mark Done</button>
            </div>
          )}
        </div>
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
