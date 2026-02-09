"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, Sparkles, Check, Chrome } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Could not send code");
      setShowOtp(true);
      setSuccess("Check your inbox");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      otp,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid code");
      setLoading(false);
    } else {
      setSuccess("Welcome!");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex p-2.5 rounded-2xl bg-foreground/5 border border-foreground/10 mb-6 backdrop-blur-xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Welcome
          </h1>
          <p className="text-foreground/40 text-sm sm:text-base">
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-foreground/2 dark:bg-foreground/3 backdrop-blur-2xl border border-foreground/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          {!showOtp ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-foreground/40 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-background/50 dark:bg-background/30 border border-foreground/10 focus:border-purple-500/50 rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-sm placeholder:text-foreground/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-foreground/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-foreground/2 dark:bg-foreground/3 px-3 text-[10px] uppercase font-bold tracking-wider text-foreground/30">
                    or
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full bg-background/50 dark:bg-background/30 border border-foreground/10 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-background/80 dark:hover:bg-background/50 active:scale-[0.98] transition-all"
              >
                <Chrome className="w-4 h-4 text-foreground/50" />
                Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Header */}
              <div className="text-center space-y-1">
                <p className="text-foreground/40 text-xs">Code sent to</p>
                <p className="text-foreground font-semibold text-sm">{email}</p>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-foreground/40 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-background/50 dark:bg-background/30 border border-foreground/10 focus:border-purple-500/50 rounded-xl py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none transition-all placeholder:text-foreground/10"
                  autoFocus
                />
              </div>

              {/* Verify Button */}
              <div className="space-y-3">
                <button
                   type="submit"
                   disabled={loading || otp.length !== 6}
                   className="w-full bg-foreground text-background py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Verify
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowOtp(false); setOtp(""); setError(""); setSuccess(""); }}
                  className="w-full text-xs text-foreground/40 hover:text-foreground/60 transition-colors py-1"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {/* Status Messages */}
          {(error || success) && (
            <div className="mt-4 text-center">
              {error && (
                <p className="text-red-500 dark:text-red-400 text-xs font-medium">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-emerald-500 dark:text-emerald-400 text-xs font-medium">
                  {success}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/20">
            Privacy · Terms · Support
          </p>
        </div>
      </div>
    </div>
  );
}




