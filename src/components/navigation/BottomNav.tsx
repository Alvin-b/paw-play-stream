import { useState } from "react";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";

const BottomNav = () => {
  const [active, setActive] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "discover", label: "Discover", icon: Search },
    { id: "create", label: "", icon: Plus },
    { id: "inbox", label: "Inbox", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.id === "create") {
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="relative flex items-center justify-center"
              >
                <div className="w-12 h-8 rounded-lg relative overflow-hidden">
                  {/* Layered colored bars behind the plus */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 rounded-lg bg-secondary" />
                  <div className="absolute right-0 top-0 bottom-0 w-10 rounded-lg bg-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-full bg-foreground rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-background" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="flex flex-col items-center gap-0.5"
            >
              <item.icon
                className={`w-6 h-6 transition-colors ${
                  active === item.id ? "text-foreground" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] transition-colors ${
                  active === item.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
