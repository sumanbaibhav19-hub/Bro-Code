"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitConnectionRequest } from "@/lib/api";
import type { Senior } from "@/lib/types";

type ConnectDialogProps = {
  senior: Senior | null;
  onClose: () => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConnectDialog({ senior, onClose }: ConnectDialogProps) {
  return (
    <Dialog open={senior !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {senior && <ConnectForm key={senior.id} senior={senior} />}
      </DialogContent>
    </Dialog>
  );
}

function ConnectForm({ senior }: { senior: Senior }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const firstName = senior.full_name.split(" ")[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      goal: goal.trim(),
    };

    if (!trimmed.name || !trimmed.goal) {
      setError("Please add your name and what you'd like help with.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed.email)) {
      setError("Please enter a valid email address so they can reply.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitConnectionRequest({
        senior_id: senior.id,
        student_name: trimmed.name,
        student_email: trimmed.email,
        goal: trimmed.goal,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center py-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-8 w-8 text-teal-700" aria-hidden />
        </div>
        <DialogTitle className="mt-4 text-xl">Request sent</DialogTitle>
        <DialogDescription className="mt-2 max-w-sm text-stone-600">
          {firstName} will receive your message and can reply to {email.trim()} directly.
        </DialogDescription>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Connect with {senior.full_name}</DialogTitle>
        <DialogDescription>
          Tell {firstName} who you are and what you are hoping to get out of a conversation.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-2 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="student-name">Your name</Label>
          <Input
            id="student-name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-email">Email</Label>
          <Input
            id="student-email"
            type="email"
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-goal">What would you like help with?</Label>
          <Textarea
            id="student-goal"
            value={goal}
            maxLength={1000}
            rows={4}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="I'm preparing for software engineering interviews and would love advice on my portfolio."
          />
          <p className="text-right text-xs text-stone-500">{goal.length}/1000</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-700 text-white transition-colors hover:bg-teal-800"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Sending..." : "Send connection request"}
        </Button>
      </form>
    </>
  );
}
