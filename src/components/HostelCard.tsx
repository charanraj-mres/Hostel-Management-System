"use client";

import React from "react";
import { Typography } from "@material-tailwind/react";
import Image from "next/image";
const HOSTELS = [
  {
    name: "Agnes Hostel",
    price: "2000",
    image: "/images/hostels/agnes_hostel.jpg",
    description: "Safe and comfortable accommodation with modern facilities",
    features: ["WiFi", "Study Room", "24/7 Security", "Mess Facility"],
  },
  {
    name: "St. Teresa Hostel",
    price: "1900",
    image: "/images/hostels/teresa_hostel.jpg",
    description:
      "Well-maintained hostel with a peaceful environment for students",
    features: ["Spacious Rooms", "Garden", "Common Area", "CCTV Security"],
  },
  {
    name: "Mother Mary Hostel",
    price: "1800",
    image: "/images/hostels/mary_hostel.jpeg",
    description: "A homely atmosphere with essential amenities for students",
    features: ["Clean Rooms", "Security", "Library Access", "Recreation Area"],
  },
];

interface HostelCardProps {
  name: string;
  price: string;
  image: string;
  description: string;
  features: string[];
}

function HostelCard({
  name,
  price,
  image,
  description,
  features,
}: HostelCardProps) {
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
            {features.map((feature: string, index: number) => (
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
          <Typography
            variant="h5"
            color="blue-gray"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {name}
          </Typography>
          <Typography
            variant="h6"
            className="text-orange-500"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            RS : {price}
            <span className="text-sm text-gray-500">/ PER MONTH</span>
          </Typography>
        </div>
        <Typography
          className="text-gray-600"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {description}
        </Typography>
        <button
          className="mt-4 w-full rounded-lg bg-blue-500 py-2.5 text-white hover:bg-blue-600 transition-colors"
          onClick={() => (window.location.href = "/admin/admission")}
        >
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
        <Typography
          variant="h2"
          color="blue-gray"
          className="mb-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Hostels - St. Agnes College
        </Typography>
        <Typography
          variant="lead"
          className="mx-auto max-w-2xl text-gray-600"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          St. Agnes College provides safe and comfortable hostel facilities for
          students, ensuring a conducive atmosphere for academic and personal
          growth.
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
