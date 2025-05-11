import React from "react";

const carWashes = Array(9).fill({
  name: "Название автомойки",
  address: "Улица Пушкина"
});

export default function CarWashGrid() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-semibold text-center mb-10">
        Выберите ближайшую автомойку для вас!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
        {carWashes.map((wash, index) => (
          <div
            key={index}
            className="w-[240px] h-[320px] relative rounded-xl overflow-hidden shadow-md bg-black text-white"
            style={{
              backgroundImage: "url('/carwash.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold">{wash.name}</h2>
                <p className="text-sm">{`Адрес: ${wash.address}`}</p>
              </div>
              <button className="bg-yellow-400 text-black font-medium rounded-lg px-4 py-2 hover:bg-yellow-500">
                Забронировать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
