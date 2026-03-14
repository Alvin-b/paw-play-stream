import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, username, displayName || username);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Check your email</h1>
          <p className="text-muted-foreground text-sm mb-8">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>
          </p>
          <Link to="/login" className="text-primary font-semibold text-sm">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">Sign up</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Create an account to follow creators, like videos, and view comments.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            className="w-full h-12 px-4 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
          <input
            type="text"
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && <p className="text-primary text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-[10px] text-muted-foreground text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and acknowledge our Privacy Policy.
        </p>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
