"use client";

import React from "react";
import { Typography } from "@material-tailwind/react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";

const TESTIMONIALS = [
  {
    feedback:
      "Living in this hostel has been an amazing experience. The facilities are top-notch, and the study environment is perfect for academic success. The staff is always helpful and friendly.",
    student: "Rahul Sharma",
    course: "B.Tech Computer Science",
    year: "3rd Year",
    rating: 5,
  },
  {
    feedback:
      "The hostel&#34;s community feel is what I love most. From quiet study spaces to weekend activities, everything is well-balanced. The mess food is surprisingly good too!",
    student: "Priya Patel",
    course: "M.Sc Physics",
    year: "2nd Year",
    rating: 5,
  },
  {
    feedback:
      "As an international student, this hostel has become my home away from home. The security is excellent, and the cultural diversity here has enriched my college experience.",
    student: "John Zhang",
    course: "BBA International Business",
    year: "Final Year",
    rating: 4,
  },
];

function TestimonialCard({ feedback, student, course, year, rating }) {
  return (
    <div className="relative rounded-xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
      {/* Quote Icon */}
      <div className="absolute -top-4 right-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="h-4 w-4"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
      </div>

      {/* Rating Stars */}
      <div className="mb-4 flex">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`h-5 w-5 ${
              index < rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Testimonial Content */}
      <Typography className="mb-6 font-normal text-gray-600">
        "{feedback}"
      </Typography>

      {/* Student Info */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
          {student[0]}
        </div>
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-1">
            {student}
          </Typography>
          <Typography className="text-sm text-gray-500">
            {course} • {year}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="px-4 py-20 bg-gray-50">
      <div className="container mx-auto">
        <div className="mb-20 flex w-full flex-col items-center">
          <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
            <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
          </div>
          <Typography variant="h2" color="blue-gray" className="mb-2">
            Student Experiences
          </Typography>
          <Typography
            variant="lead"
            className="mb-10 max-w-3xl text-center text-gray-600"
          >
            Hear directly from our residents about their experiences living in
            our hostels. Their stories reflect our commitment to providing a
            comfortable and enriching environment for students.
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((props, key) => (
            <TestimonialCard key={key} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
