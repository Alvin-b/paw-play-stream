import { Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeedHeaderProps {
  activeTab: "following" | "foryou";
  onTabChange: (tab: "following" | "foryou") => void;
}

const FeedHeader = ({ activeTab, onTabChange }: FeedHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center pt-3 pb-2 px-4 pointer-events-none">
      <button
        onClick={() => navigate("/live")}
        className="pointer-events-auto flex items-center gap-1"
      >
        <Radio className="w-5 h-5 text-primary" />
        <span className="text-foreground text-xs font-semibold">LIVE</span>
      </button>

      <div className="flex gap-4 items-center pointer-events-auto">
        <button
          onClick={() => onTabChange("following")}
          className={`text-base font-semibold transition-opacity ${
            activeTab === "following" ? "text-foreground opacity-100" : "text-foreground opacity-50"
          }`}
        >
          Following
        </button>
        <span className="text-foreground/30 text-lg">|</span>
        <button
          onClick={() => onTabChange("foryou")}
          className={`text-base font-semibold transition-opacity ${
            activeTab === "foryou" ? "text-foreground opacity-100" : "text-foreground opacity-50"
          }`}
        >
          For You
        </button>
      </div>

      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export default FeedHeader;
