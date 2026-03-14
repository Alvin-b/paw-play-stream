import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Camera } from "lucide-react";

interface EditProfileModalProps {
  onClose: () => void;
}

const EditProfileModal = ({ onClose }: EditProfileModalProps) => {
  const { profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("profiles")
      .update({ username, display_name: displayName, bio })
      .eq("user_id", profile.user_id);

    if (error) {
      setError(error.message);
    } else {
      await refreshProfile();
      onClose();
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !profile) return;
    const file = e.target.files[0];
    const ext = file.name.split(".").pop();
    const path = `${profile.user_id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", profile.user_id);
    await refreshProfile();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose}><X className="w-6 h-6 text-foreground" /></button>
        <span className="text-foreground font-semibold">Edit profile</span>
        <button onClick={handleSave} disabled={loading} className="text-primary font-semibold text-sm disabled:opacity-50">
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {profile?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
              <Camera className="w-4 h-4 text-foreground" />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              className="w-full h-11 px-3 rounded-lg bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={80}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/80</p>
          </div>
        </div>

        {error && <p className="text-primary text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default EditProfileModal;
