import { Heart } from "lucide-react";

const HeartBurst = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <Heart className="w-24 h-24 fill-primary text-primary animate-heart-burst" />
    </div>
  );
};

export default HeartBurst;
