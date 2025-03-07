"use client";

import React, { useState, useEffect } from "react";

const videoIds = [
  "aWmjaRbkGww",
  "Nut2rshzNNs", // Example video IDs, replace with yours
  "OYXRJS2J1J4",
  "nvZ6T2uv5Ns",
];

export function VideoIntro() {
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    const randomVideo = videoIds[Math.floor(Math.random() * videoIds.length)];
    setVideoId(randomVideo);
  }, []);

  return (
    <div className="p-8">
      <div className="w-full container px-5 overflow-hidden rounded-xl relative mx-auto mt-20 max-w-6xl aspect-video">
        {/* Removed the overlay or added pointer-events-none */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full rounded-xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        ></iframe>
      </div>
    </div>
  );
}

export default VideoIntro;
