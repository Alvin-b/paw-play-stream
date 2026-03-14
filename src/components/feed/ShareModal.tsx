import { AnimatePresence, motion } from "framer-motion";
import { X, Link as LinkIcon, MessageCircle, Copy, Flag } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
    onClose();
  };

  const shareOptions = [
    { icon: MessageCircle, label: "Message", action: () => toast.info("Coming soon") },
    { icon: LinkIcon, label: "Copy link", action: handleCopyLink },
    { icon: Copy, label: "Embed", action: () => toast.info("Coming soon") },
    { icon: Flag, label: "Report", action: () => toast.info("Coming soon") },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 z-40" onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-foreground font-semibold text-sm">Share to</span>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-4 gap-4 p-6">
              {shareOptions.map((opt) => (
                <button key={opt.label} onClick={opt.action} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <opt.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-foreground text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
