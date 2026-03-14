import VideoFeed from "@/components/feed/VideoFeed";
import BottomNav from "@/components/navigation/BottomNav";

const Index = () => {
  return (
    <div className="w-full h-dvh bg-background overflow-hidden">
      <VideoFeed />
      <BottomNav />
    </div>
  );
};

export default Index;
