import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">Log in</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Manage your account, check notifications, comment on videos, and more.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary text-sm"
              required
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

          <Link to="/forgot-password" className="block text-xs text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
