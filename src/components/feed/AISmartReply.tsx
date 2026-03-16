import { useState } from "react";
import { useAISmartReply } from "@/hooks/useAIFeatures";
import { Sparkles, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISmartReplyProps {
  comment: string;
  videoDescription?: string;
  commentCount?: number;
  replyCount?: number;
  username?: string;
  onSelectReply: (reply: string) => void;
  onClose: () => void;
}

export function AISmartReply({
  comment,
  videoDescription,
  commentCount,
  replyCount,
  username,
  onSelectReply,
  onClose
}: AISmartReplyProps) {
  const { suggestions, getReplies, loading, error } = useAISmartReply();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    await getReplies(comment, videoDescription, commentCount, replyCount, username);
  };

  const handleCopy = (reply: string, index: number) => {
    navigator.clipboard.writeText(reply);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (reply: string) => {
    onSelectReply(reply);
    onClose();
  };

  return (
    <div className="bg-card border rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">AI Reply Suggestions</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!suggestions && !loading && (
        <Button 
          onClick={handleGenerate} 
          className="w-full"
          size="sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Replies
        </Button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Generating replies...</span>
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm py-2">{error}</div>
      )}

      {suggestions?.suggestions && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className={`px-2 py-0.5 rounded-full ${
              suggestions.sentiment === 'positive' ? 'bg-green-500/20 text-green-500' :
              suggestions.sentiment === 'negative' ? 'bg-red-500/20 text-red-500' :
              'bg-gray-500/20 text-gray-500'
            }`}>
              {suggestions.sentiment}
            </span>
            <span>•</span>
            <span>{suggestions.category}</span>
          </div>
          
          {suggestions.suggestions.map((reply, index) => (
            <div 
              key={index}
              className="group flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <button
                onClick={() => handleSelect(reply)}
                className="flex-1 text-left text-sm"
              >
                {reply}
              </button>
              <button
                onClick={() => handleCopy(reply, index)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-background transition-all"
              >
                {copiedIndex === index ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {suggestions?.best_reply && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground block mb-1">Best reply:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium flex-1">{suggestions.best_reply}</span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleSelect(suggestions.best_reply)}
            >
              Use This
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
