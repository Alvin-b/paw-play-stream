import { Radio, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeedHeaderProps {
  activeTab: "following" | "foryou";
  onTabChange: (tab: "following" | "foryou") => void;
}

const FeedHeader = ({ activeTab, onTabChange }: FeedHeaderProps) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "following" as const, label: "Following" },
    { id: "foryou" as const, label: "For You" },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pt-2 pb-1 px-4 pointer-events-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/live")}
            className="pointer-events-auto flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
          >
            <Radio className="w-4 h-4 text-primary" />
            <span className="text-foreground text-[10px] font-bold tracking-wide">LIVE</span>
          </button>
          <div className="h-6 w-px bg-border" />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-3 py-1"
            >
              <span
                className={`text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-foreground/50"
                }`}
              >
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/discover")}
          className="pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
        >
          <Search className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default FeedHeader;
