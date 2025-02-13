"use client";

import React from "react";
import Image from "next/image";

function Hero() {
  return (
    <div className="relative min-h-screen w-full">
      <header className="grid !min-h-[49rem] bg-gray-900 px-8">
        <div className="container mx-auto mt-32 grid h-full w-full grid-cols-1 place-items-center lg:mt-14 lg:grid-cols-2">
          <div className="col-span-1">
            <h1 className="text-4xl font-bold text-white mb-4 md:text-5xl lg:text-6xl">
              Smart Hostel <br /> Management System
            </h1>
            <p className="text-xl text-white/90 mb-7 md:pr-16 xl:pr-28">
              Streamline your hostel operations with our comprehensive
              management solution. Efficient room allocation, billing, and
              student management all in one place.
            </p>
            <h6 className="mb-4 text-lg font-semibold text-white">
              Key Features
            </h6>
            <div className="flex flex-col gap-2 md:mb-2 md:w-10/12 md:flex-row">
              <button className="bg-white text-blue-900 px-6 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Room Management
              </button>
              <button className="bg-white text-blue-900 px-6 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Billing System
              </button>
            </div>
          </div>
          <div className="col-span-1 my-20 lg:my-0">
            <Image
              width={470}
              height={576}
              src="/api/placeholder/470/576"
              alt="Hostel Management Dashboard"
              className="h-full max-h-[30rem] -translate-y-32 md:max-h-[36rem] lg:max-h-[40rem] lg:translate-y-0"
            />
          </div>
        </div>
      </header>
      <div className="mx-8 lg:mx-16 -mt-24 rounded-xl bg-white p-5 md:p-14 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <label
              className="block text-gray-800 font-semibold mb-2"
              htmlFor="location"
            >
              Enter Location
            </label>
            <input
              type="text"
              id="location"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your location"
            />
          </div>

          <div className="col-span-1">
            <label
              className="block text-gray-800 font-semibold mb-2"
              htmlFor="date"
            >
              Living Date
            </label>
            <input
              type="date"
              id="date"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-1">
            <label
              className="block text-gray-800 font-semibold mb-2"
              htmlFor="gender"
            >
              Gender
            </label>
            <select
              id="gender"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              defaultValue="boys"
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </div>

          <div className="col-span-1">
            <label
              className="block text-gray-800 font-semibold mb-2"
              htmlFor="age"
            >
              Age
            </label>
            <select
              id="age"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              defaultValue="16"
            >
              {[...Array(43)].map((_, i) => (
                <option key={i + 16} value={i + 16}>
                  {i + 16}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="px-8 py-3 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500">
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
