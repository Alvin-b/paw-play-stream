import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-8">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Email sent</h1>
          <p className="text-muted-foreground text-sm mb-8">Check your inbox for a password reset link.</p>
          <Link to="/login" className="text-primary font-semibold text-sm">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">Reset password</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
          {error && <p className="text-primary text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
