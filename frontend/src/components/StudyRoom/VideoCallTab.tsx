import { useState, useRef, useEffect } from "react";
import { Video, Mic, MicOff, VideoOff, Monitor, MonitorOff, Users, PhoneOff } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";

interface VideoCallTabProps {
  roomId: string;
  participants: Array<{ id: string; name: string; avatar: string }>;
}

export function VideoCallTab({ roomId, participants }: VideoCallTabProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<HTMLVideoElement[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Initialize local video/audio
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localStreamRef.current = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Không thể truy cập camera/microphone");
      }
    };

    initMedia();

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peerConnectionsRef.current.forEach(pc => pc.close());
    };
  }, []);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current && localStreamRef.current) {
          // Replace video track
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionsRef.current.values().next().value?.getSenders()
            .find((s: RTCRtpSender) => s.track?.kind === 'video');
          
          if (sender) {
            sender.replaceTrack(videoTrack);
          }

          localVideoRef.current.srcObject = screenStream;
          setIsScreenSharing(true);

          // Stop screen share when user clicks stop
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        // Restore camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localStreamRef.current = stream;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
      toast.error("Không thể chia sẻ màn hình");
    }
  };

  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peerConnectionsRef.current.forEach(pc => pc.close());
    toast.info("Đã rời cuộc gọi");
  };

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        <Card className="relative overflow-hidden bg-black rounded-xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
            Bạn {!isVideoOn && "(Camera tắt)"}
          </div>
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl">
                {participants[0]?.avatar || "👤"}
              </div>
            </div>
          )}
        </Card>

        {/* Remote Videos */}
        {remoteStreams.map((stream, index) => (
          <Card key={index} className="relative overflow-hidden bg-black rounded-xl">
            <video
              ref={(el) => {
                if (el) remoteVideoRefs.current[index] = el;
              }}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
              {participants[index + 1]?.name || `Người tham gia ${index + 1}`}
            </div>
          </Card>
        ))}

        {/* Placeholder for more participants */}
        {remoteStreams.length === 0 && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl h-64 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
              <p className="text-gray-600">Đang chờ người tham gia...</p>
            </div>
          </Card>
        )}
      </div>

      {/* Controls */}
      <Card className="p-4 bg-white">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isAudioOn ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isVideoOn ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6" />
            ) : (
              <Monitor className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={leaveCall}
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Room ID: <span className="font-mono font-semibold">{roomId}</span></p>
          <p className="mt-1">{participants.length} người tham gia</p>
        </div>
      </Card>

      {/* Voice Only Mode Info */}
      <Card className="p-4 bg-indigo-50 border-2 border-indigo-200">
        <div className="flex items-center gap-2 text-indigo-700">
          <Mic className="w-5 h-5" />
          <p className="text-sm">
            <strong>Voice Only Mode:</strong> Tắt camera để tiết kiệm bandwidth. 
            Chỉ cần mic để thảo luận!
          </p>
        </div>
      </Card>
    </div>
  );
}
