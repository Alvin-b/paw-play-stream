import React from "react";
import { Heart } from "lucide-react";

interface HeartBurstProps {
  x?: number;
  y?: number;
}

const HeartBurst = ({ x, y }: HeartBurstProps) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: x !== undefined ? x - 48 : '50%',
    top: y !== undefined ? y - 48 : '50%',
    transform: x !== undefined && y !== undefined ? 'translate(0, 0)' : 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 30,
  };

  return (
    <div style={style}>
      <Heart className="w-24 h-24 fill-primary text-primary animate-heart-burst" />
    </div>
  );
};

export default HeartBurst;
