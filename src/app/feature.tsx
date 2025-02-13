"use client";

import React from "react";
import { Typography } from "@material-tailwind/react";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  WifiIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const FEATURES = [
  {
    icon: HomeIcon,
    title: "Modern Accommodations",
    description:
      "Fully furnished rooms with contemporary amenities, ensuring comfort and convenience for all residents.",
    color: "blue",
  },
  {
    icon: ShieldCheckIcon,
    title: "24/7 Security",
    description:
      "Round-the-clock security personnel, CCTV surveillance, and secure access control for your peace of mind.",
    color: "green",
  },
  {
    icon: WifiIcon,
    title: "High-Speed Internet",
    description:
      "Seamless connectivity with high-speed WiFi coverage throughout the premises for work and entertainment.",
    color: "purple",
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "Maintenance Support",
    description:
      "Quick response maintenance team available to handle repairs and upkeep of all facilities.",
    color: "orange",
  },
  {
    icon: BuildingOfficeIcon,
    title: "Study Areas",
    description:
      "Dedicated quiet zones and collaborative spaces designed for focused learning and group discussions.",
    color: "teal",
  },
  {
    icon: UserGroupIcon,
    title: "Community Events",
    description:
      "Regular social activities and events to foster a vibrant community atmosphere among residents.",
    color: "red",
  },
];

function FeatureCard({ icon: Icon, title, description, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    purple: "bg-purple-50 text-purple-500",
    orange: "bg-orange-50 text-orange-500",
    teal: "bg-teal-50 text-teal-500",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`mb-6 rounded-xl p-4 w-16 h-16 ${colorMap[color]}`}>
        <Icon className="h-8 w-8" />
      </div>
      <Typography variant="h5" color="blue-gray" className="mb-3">
        {title}
      </Typography>
      <Typography className="font-normal !text-gray-500">
        {description}
      </Typography>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
    </div>
  );
}

export function Features() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto mb-20 text-center">
        <Typography
          variant="small"
          color="blue"
          className="mb-2 font-bold uppercase tracking-wider"
        >
          Why Choose Our Hostel
        </Typography>
        <Typography variant="h2" color="blue-gray" className="mb-4">
          Premium Facilities & Services
        </Typography>
        <Typography
          variant="lead"
          className="mx-auto w-full px-4 !text-gray-500 lg:w-3/5"
        >
          Experience comfortable living with our state-of-the-art facilities and
          comprehensive services designed to make your stay memorable and
          hassle-free.
        </Typography>
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((props, idx) => (
          <FeatureCard key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

export default Features;
