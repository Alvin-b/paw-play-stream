import { useState } from "react";

const FeedHeader = () => {
  const [activeTab, setActiveTab] = useState<"following" | "foryou">("foryou");

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex justify-center items-center pt-3 pb-2 pointer-events-none">
      <div className="flex gap-4 items-center pointer-events-auto">
        <button
          onClick={() => setActiveTab("following")}
          className={`text-base font-semibold transition-opacity ${
            activeTab === "following" ? "text-foreground opacity-100" : "text-foreground opacity-50"
          }`}
        >
          Following
        </button>
        <span className="text-foreground/30 text-lg">|</span>
        <button
          onClick={() => setActiveTab("foryou")}
          className={`text-base font-semibold transition-opacity ${
            activeTab === "foryou" ? "text-foreground opacity-100" : "text-foreground opacity-50"
          }`}
        >
          For You
        </button>
      </div>
    </div>
  );
};

export default FeedHeader;
