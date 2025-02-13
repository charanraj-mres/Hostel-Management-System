"use client";

import React from "react";
import { Typography } from "@material-tailwind/react";
import Image from "next/image";
const HOSTELS = [
  {
    name: "Jagannath Hostel",
    price: "1800",
    image: "/api/placeholder/600/400",
    description: "Luxury accommodation with modern amenities and 24/7 security",
    features: ["AC Rooms", "WiFi", "Study Area", "Garden View"],
  },
  {
    name: "Lalitgiri Hostel",
    price: "1700",
    image: "/api/placeholder/600/400",
    description:
      "Peaceful environment with well-maintained garden and facilities",
    features: ["Spacious Rooms", "Garden", "Common Area", "Sports Facility"],
  },
  {
    name: "Dharmapada Hostel",
    price: "1700",
    image: "/api/placeholder/600/400",
    description: "Comfortable stay with all essential amenities for students",
    features: ["Clean Rooms", "Security", "Mess Facility", "Study Hall"],
  },
];

function HostelCard({ name, price, image, description, features }) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={600}
          height={400}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h5" color="blue-gray">
            {name}
          </Typography>
          <Typography variant="h6" className="text-orange-500">
            RS : {price}
            <span className="text-sm text-gray-500">/ PER MONTH</span>
          </Typography>
        </div>
        <Typography className="text-gray-600">{description}</Typography>
        <button className="mt-4 w-full rounded-lg bg-blue-500 py-2.5 text-white hover:bg-blue-600 transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
}

export function HostelShowcase() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto text-center mb-16">
        <Typography variant="h2" color="blue-gray" className="mb-4">
          Hostels
        </Typography>
        <Typography variant="lead" className="mx-auto max-w-2xl text-gray-600">
          A hostel is a shelter for the students who come from far off places.
          Students live there with each other and learn the value of discipline
          and co-operation. The atmosphere of a hostel is conducive to study.
        </Typography>
      </div>
      <div className="container mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {HOSTELS.map((hostel, index) => (
          <HostelCard key={index} {...hostel} />
        ))}
      </div>
    </section>
  );
}

export default HostelShowcase;
