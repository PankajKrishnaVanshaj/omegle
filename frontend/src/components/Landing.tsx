//landing.tsx

import { useEffect, useRef, useState } from "react";
import { RoomPage } from "./Room";

export const LandingPage = () => {
  const [name, setName] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play();
      }
    } catch (error) {
      setError(
        "Error accessing camera and microphone. Please allow access and try again."
      );
      console.error("Error accessing camera and microphone:", error);
    }
  };

  useEffect(() => {
    initializeMediaStream();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleJoinClick = () => {
    if (name.trim() === "") {
      setError("Please enter your name.");
      return;
    }
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <video
          ref={videoElementRef}
          autoPlay
          className="w-full max-w-md border mb-4"
        />
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-2 rounded"
        />
        <button
          onClick={handleJoinClick}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Join
        </button>
      </div>
    );
  }

  return <RoomPage name={name} localStream={localStream} />;
};
