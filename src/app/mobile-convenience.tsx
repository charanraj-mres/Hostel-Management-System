"use client";

import React from "react";
import Image from "next/image";
import { Typography } from "@material-tailwind/react";

const STATISTICS = [
  {
    title: "500+",
    description: "Happy Students",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: "50+",
    description: "Rooms Available",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    title: "24/7",
    description: "Security & Support",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "4.8/5",
    description: "Student Rating",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
];

type StatcardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function StatCard({ title, description, icon }: StatcardProps) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-8 shadow-lg transition-all hover:shadow-xl">
      <div className="mb-4 inline-block rounded-lg bg-blue-50 p-4 text-blue-500">
        {icon}
      </div>
      <Typography
        variant="h3"
        className="mb-2 text-3xl font-bold text-blue-gray-900"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        {title}
      </Typography>
      <Typography
        className="font-normal text-gray-600"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        {description}
      </Typography>
    </div>
  );
}

export function HostelStats() {
  return (
    <section className="py-20 px-8 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
        <div className="relative col-span-1">
          <Image
            width={600}
            height={800}
            src="/images/hostel_img/hostel_img_9.jpg"
            alt="Modern Hostel Building"
            className="rounded-xl shadow-xl"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-[2px]"></div>
        </div>
        <div className="col-span-1 mx-auto max-w-lg px-4 lg:px-0">
          <Typography
            variant="h2"
            color="blue-gray"
            className="mb-4"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Why Choose Our Hostels?
          </Typography>
          <Typography
            variant="lead"
            className="mb-8 text-gray-600"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Experience comfortable living with our state-of-the-art facilities
            and comprehensive services. We provide a safe and nurturing
            environment for students to thrive in their academic journey.
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STATISTICS.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HostelStats;
