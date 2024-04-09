import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SIGNALING_SERVER_URL = "http://localhost:3000";

export const usePeerConnection = () => {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<SocketIOClient.Socket | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection();
      pc.ontrack = (event) => {
        if (remoteStreamRef.current !== event.streams[0]) {
          setRemoteStream(event.streams[0]);
          remoteStreamRef.current = event.streams[0];
        }
      };

      // Send ICE candidates to peer
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", event.candidate);
        }
      };

      setPeerConnection(pc);
    } catch (error) {
      console.error("Error creating peer connection:", error);
    }
  };

  const closePeerConnection = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null); // Reset peer connection state
      setRemoteStream(null); // Reset remote stream state
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  useEffect(() => {
    const socket = io(SIGNALING_SERVER_URL);
    socketRef.current = socket;

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", answer);
      }
    });

    socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    createPeerConnection();

    return closePeerConnection; // Return the cleanup function
  }, []);

  return {
    peerConnection,
    remoteStream,
    createPeerConnection,
    closePeerConnection,
  }; // Include closePeerConnection in the return object
};
