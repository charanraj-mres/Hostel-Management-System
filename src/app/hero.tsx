"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const carouselImages = [
  {
    src: "/images/hostel_img/hostel_img_1.jpg",
    alt: "Hostel Modern Rooms",
  },
  {
    src: "/images/hostel_img/hostel_img_2.jpg",
    alt: "Student Common Area",
  },
  {
    src: "/images/hostel_img/hostel_img_3.jpg",
    alt: "Dining Facilities",
  },
  {
    src: "/images/hostel_img/hostel_img_4.jpg",
    alt: "Study Space",
  },
  {
    src: "/images/hostel_img/hostel_img_5.jpg",
    alt: "Hostel Garden",
  },
  {
    src: "/images/hostel_img/hostel_img_6.jpg",
    alt: "Hostel Reception",
  },
  {
    src: "/images/hostel_img/hostel_img_7.jpg",
    alt: "Hostel Modern Rooms",
  },
  {
    src: "/images/hostel_img/hostel_img_8.jpg",
    alt: "Student Common Area",
  },
  {
    src: "/images/hostel_img/hostel_img_9.jpg",
    alt: "Dining Facilities",
  },
];

function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <header className="grid !min-h-[49rem] bg-gradient-to-br from-gray-900 to-gray-800 px-8">
        <div className="container mx-auto mt-32 grid h-full w-full grid-cols-1 place-items-center lg:mt-14 lg:grid-cols-2">
          <div className="col-span-1 z-10">
            <div className="relative inline-block">
              <div className="absolute -left-4 top-0 h-20 w-2 bg-orange-400"></div>
              <h1 className="text-4xl font-bold text-white mb-4 md:text-5xl lg:text-6xl">
                Hostel Management System <br /> for St Agnes college
              </h1>
            </div>
            <p className="text-xl text-white/90 mb-7 md:pr-16 xl:pr-28">
              Streamline your hostel operations with our comprehensive
              management solution. Efficient room allocation, billing, and
              student management all in one place.
            </p>
            <h6 className="mb-4 text-lg font-semibold text-white">
              Key Features
            </h6>
            <div className="flex flex-col gap-2 md:mb-2 md:w-10/12 md:flex-row">
              <button className="bg-white text-blue-900 px-6 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl">
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
              <button className="bg-orange-400 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-orange-500 transition-colors shadow-lg hover:shadow-xl">
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
          <div className="col-span-1 my-20 lg:my-0 relative">
            <div className="relative w-[470px] h-[576px] overflow-hidden rounded-2xl shadow-2xl">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                    currentImage === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    fill
                    src={image.src}
                    alt={image.alt}
                    className="object-cover"
                  />
                </div>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImage === index
                        ? "w-6 bg-orange-400"
                        : "bg-white/60"
                    }`}
                    onClick={() => setCurrentImage(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-8 lg:mx-16 -mt-24 rounded-xl bg-white p-5 md:p-14 shadow-xl">
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all appearance-none bg-white"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all appearance-none bg-white"
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
          <button className="px-8 py-3 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg hover:shadow-xl">
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
