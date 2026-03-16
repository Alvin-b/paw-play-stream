import { useState } from "react";
import { DollarSign, Gift, Star, TrendingUp, Wallet, CreditCard, ChevronRight, Trophy, Zap, Users, Heart, Play } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  type: "gift" | "tip" | "withdrawal" | "earning";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending";
}

interface GiftData {
  id: string;
  name: string;
  value: number;
  icon: string;
}

const GIFTS: GiftData[] = [
  { id: "1", name: "Rose", value: 1, icon: "🌹" },
  { id: "2", name: "Heart", value: 5, icon: "💖" },
  { id: "3", name: "Diamond", value: 10, icon: "💎" },
  { id: "4", name: "Crown", value: 50, icon: "👑" },
  { id: "5", name: "Rocket", value: 100, icon: "🚀" },
  { id: "6", name: "Castle", value: 500, icon: "🏰" },
  { id: "7", name: "Dragon", value: 1000, icon: "🐉" },
  { id: "8", name: "Rainbow", value: 2000, icon: "🌈" },
];

const CreatorFund = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "gifts" | "withdraw">("overview");
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null);
  
  // Sample data
  const [balance] = useState(1250.50);
  const [pendingBalance] = useState(150.00);
  const [totalEarnings] = useState(15420.00);
  const [monthlyEarnings] = useState(890.50);
  
  const [transactions] = useState<Transaction[]>([
    { id: "1", type: "gift", amount: 50, description: "Received 10 Roses", date: "2024-01-15", status: "completed" },
    { id: "2", type: "tip", amount: 25, description: "Tip from @user123", date: "2024-01-14", status: "completed" },
    { id: "3", type: "withdrawal", amount: -500, description: "Withdrawal to Bank", date: "2024-01-13", status: "completed" },
    { id: "4", type: "earning", amount: 120, description: "Video views bonus", date: "2024-01-12", status: "completed" },
    { id: "5", type: "gift", amount: 500, description: "Received 1 Castle", date: "2024-01-11", status: "pending" },
  ]);

  const handleWithdraw = () => {
    if (!user) {
      toast.error("Please log in to withdraw");
      return;
    }
    if (balance < 50) {
      toast.error("Minimum withdrawal is $50");
      return;
    }
    toast.success("Withdrawal request submitted!");
  };

  const handleSendGift = () => {
    if (!user) {
      toast.error("Please log in to send gifts");
      return;
    }
    toast.success(`Gift sent!`);
    setSelectedGift(null);
  };

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center px-8">
          <DollarSign className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Creator Fund</h2>
          <p className="text-muted-foreground text-sm mb-6">Sign in to access creator monetization features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-transparent p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Creator Fund</h1>
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">Available Balance</span>
            <Wallet className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-4xl font-bold mb-2">${balance.toLocaleString()}</p>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span>+${pendingBalance} pending</span>
            <span>|</span>
            <span>${totalEarnings.toLocaleString()} total</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-background/50 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold text-foreground">${monthlyEarnings}</p>
            <p className="text-[10px] text-muted-foreground">This Month</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold text-foreground">1,234</p>
            <p className="text-[10px] text-muted-foreground">Supporters</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold text-foreground">$4.20</p>
            <p className="text-[10px] text-muted-foreground">Avg Gift</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        {(["overview", "gifts", "withdraw"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab === "overview" ? "Overview" : tab === "gifts" ? "Send Gifts" : "Withdraw"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* How to Earn */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">How to Earn</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Receive Gifts</p>
                    <p className="text-xs text-muted-foreground">Supporters can send you virtual gifts during live streams</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Video Views</p>
                    <p className="text-xs text-muted-foreground">Earn from views on your videos based on engagement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">New Followers</p>
                    <p className="text-xs text-muted-foreground">Bonus earnings for gaining new followers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === "withdrawal" ? "bg-red-500/20" : "bg-green-500/20"
                      }`}>
                        {tx.type === "gift" && <Gift className="w-4 h-4 text-red-500" />}
                        {tx.type === "tip" && <Heart className="w-4 h-4 text-pink-500" />}
                        {tx.type === "withdrawal" && <CreditCard className="w-4 h-4 text-red-500" />}
                        {tx.type === "earning" && <TrendingUp className="w-4 h-4 text-green-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "gifts" && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Send a Gift</h3>
              <p className="text-sm text-muted-foreground mb-4">Select a gift to send to your favorite creator</p>
              
              <div className="grid grid-cols-4 gap-3">
                {GIFTS.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                      selectedGift?.id === gift.id
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <span className="text-2xl mb-1">{gift.icon}</span>
                    <span className="text-xs text-foreground font-medium">{gift.name}</span>
                    <span className="text-[10px] text-muted-foreground">${gift.value}</span>
                  </button>
                ))}
              </div>

              {selectedGift && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Send {selectedGift.icon} {selectedGift.name}</p>
                      <p className="text-xs text-muted-foreground">${selectedGift.value}</p>
                    </div>
                    <button
                      onClick={handleSendGift}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      Send Gift
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Gift Leaderboard */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Top Gifters
              </h3>
              <div className="space-y-2">
                {[
                  { rank: 1, name: "SuperFan99", gifts: "$5,420" },
                  { rank: 2, name: "DiamondLover", gifts: "$3,890" },
                  { rank: 3, name: "RoyalSupporter", gifts: "$2,150" },
                  { rank: 4, name: "LiveViewer", gifts: "$1,200" },
                  { rank: 5, name: "ContentLover", gifts: "$980" },
                ].map((gifter) => (
                  <div key={gifter.rank} className="flex items-center gap-3 py-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      gifter.rank === 1 ? "bg-yellow-500 text-black" :
                      gifter.rank === 2 ? "bg-gray-400 text-black" :
                      gifter.rank === 3 ? "bg-orange-400 text-black" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {gifter.rank}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">{gifter.name}</span>
                    <span className="text-sm font-semibold text-green-500">{gifter.gifts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "withdraw" && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Withdraw Funds</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Available Balance</span>
                    <span className="text-lg font-bold text-foreground">${balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="text-sm text-yellow-500">${pendingBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-3">Withdraw To</p>
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Bank Account ****4521</p>
                      <p className="text-xs text-muted-foreground">Chase Bank</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={balance < 50}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw ${balance.toLocaleString()}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  Minimum withdrawal: $50 • Processing time: 2-5 business days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorFund;
