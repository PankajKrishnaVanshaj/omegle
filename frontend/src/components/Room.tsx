// room.tsx

import { useEffect, useRef, useState } from "react";
import { usePeerConnection } from "./usePeerConnection";
import io from "socket.io-client";

const SIGNALING_SERVER_URL = "http://localhost:3000";

export const RoomPage = ({
  name,
  localStream,
}: {
  name: string;
  localStream: MediaStream | null;
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const { createPeerConnection, remoteStream, closePeerConnection } =
    usePeerConnection();
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    createPeerConnection();
    const socket = io(SIGNALING_SERVER_URL);
    socketRef.current = socket;

    socket.on("message", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      socket.disconnect(); // Disconnect socket only
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    closePeerConnection();
  };

  const handleMessageSend = () => {
    const message = messageInputRef.current?.value;
    if (message && socketRef.current) {
      socketRef.current.emit("message", message);
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      messageInputRef.current!.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="w-full max-w-md border mb-4"
      />
      <div className="text-lg font-semibold mb-4">
        Waiting for connection...
      </div>
      <video ref={remoteVideoRef} autoPlay className="w-full max-w-md border" />
      <div className="flex flex-col w-full max-w-md border p-4 mt-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            {message}
          </div>
        ))}
        <div className="flex">
          <input
            type="text"
            ref={messageInputRef}
            className="border border-gray-300 rounded-md p-2 mr-2"
          />
          <button
            onClick={handleMessageSend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
      <button
        onClick={handleEndCall}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        End Call
      </button>
    </div>
  );
};
