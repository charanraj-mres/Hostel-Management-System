"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/card";

const FAQS = [
  {
    title: "How do I book a hostel room?",
    desc: "Booking a room is simple! Visit our booking section, select your preferred room type, choose your check-in and check-out dates, and complete the payment process. You'll receive a confirmation email with your booking details.",
  },
  {
    title: "What are the check-in and check-out times?",
    desc: "Standard check-in time is 2:00 PM and check-out time is 11:00 AM. Early check-in or late check-out may be available upon request, subject to availability and additional charges.",
  },
  {
    title: "What amenities are included in the room rate?",
    desc: "Our room rates include free Wi-Fi, bed linens, shared kitchen access, common room facilities, and lockers. Additional services like laundry and breakfast may be available for an extra charge.",
  },
  {
    title: "How can I modify or cancel my reservation?",
    desc: "You can modify or cancel your reservation through your account dashboard up to 48 hours before check-in. Different cancellation policies may apply based on your room type and booking conditions.",
  },
  {
    title: "What payment methods do you accept?",
    desc: "We accept major credit cards (Visa, MasterCard, American Express), debit cards, and online payment services. Payment must be made in advance to secure your booking.",
  },
  {
    title: "Is there a security deposit required?",
    desc: "Yes, we require a refundable security deposit at check-in. The amount varies depending on your room type and length of stay. The deposit will be returned upon check-out after room inspection.",
  },
];

export function Faqs() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Everything you need to know about our hostel booking and management
            system
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FAQS.map(({ title, desc }) => (
            <Card key={title} className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faqs;
