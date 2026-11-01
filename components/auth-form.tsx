"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  onSignedIn: () => void;
};

export function AuthForm({ onSignedIn }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();

    if (isSignUp && !trimmedName) {
      setError("Please add the name other students will see.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password needs at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (isSignUp) {
        const hasSession = await signUp(trimmedEmail, password, trimmedName);
        if (hasSession) {
          onSignedIn();
        } else {
          setNotice("Almost there. Check your inbox to confirm your email, then sign in.");
          setMode("sign-in");
        }
      } else {
        await signIn(trimmedEmail, password);
        onSignedIn();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <div className="grid grid-cols-2 rounded-full bg-stone-100 p-1" role="tablist" aria-label="Account">
        {(["sign-up", "sign-in"] as AuthMode[]).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={mode === option}
            onClick={() => {
              setMode(option);
              setError(null);
            }}
            className={`rounded-full py-2 text-sm font-medium transition-colors ${
              mode === option ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {option === "sign-up" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight">
        {isSignUp ? "Join your student community" : "Welcome back"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {isSignUp
          ? "Create a free account to share notes and keep track of your mentorship requests."
          : "Sign in to access shared notes and your requests."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="auth-name">Full name</Label>
            <Input
              id="auth-name"
              value={displayName}
              maxLength={100}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              placeholder="Alex Morgan"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@university.edu"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            value={password}
            maxLength={72}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
            {notice}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-700 text-white transition-colors hover:bg-teal-800"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
