import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Send, Heart, PartyPopper } from "lucide-react";
import { addFeedback, listFeedback, FEEDBACK_TOPICS } from "@/lib/feedback";
import { useSettings } from "@/hooks/use-settings";
import { playSuccess } from "@/lib/sound";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FeedbackPage() {
  const { nickname } = useSettings();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [topic, setTopic] = useState(FEEDBACK_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(nickname);
  const [sent, setSent] = useState(false);
  const [recent, setRecent] = useState(() => listFeedback());

  const canSend = rating > 0 && message.trim().length > 1;

  function submit() {
    if (!canSend) return;
    addFeedback({ rating, topic, message: message.trim(), name: name.trim() });
    playSuccess();
    setRecent(listFeedback());
    setSent(true);
  }

  function again() {
    setRating(0);
    setHover(0);
    setTopic(FEEDBACK_TOPICS[0]);
    setMessage("");
    setSent(false);
  }

  return (
    <div className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-2xl"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pink)]/15 px-3.5 py-1.5 text-sm font-500 text-[var(--pink)]">
          <Heart className="size-4" /> We read every note
        </span>
        <h1 className="mt-4 font-display text-4xl font-700 tracking-tight">Send feedback</h1>
        <p className="mt-2 text-muted-foreground">
          Got a game idea, a bug, or just some love? Tell us — it shapes what we build next.
        </p>

        <div className="mt-8 rounded-3xl border border-border/70 bg-card p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] sm:p-7">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <PartyPopper className="mx-auto size-12 text-primary" />
                <h2 className="mt-4 font-display text-2xl font-700">Thank you!</h2>
                <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                  Your feedback landed safely. It really does help us make Pocket Play better.
                </p>
                <button
                  onClick={again}
                  className="press mt-6 rounded-full bg-primary px-6 py-3 font-600 text-primary-foreground"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Rating */}
                <div>
                  <label className="text-sm font-600">How's your experience?</label>
                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className="press"
                      >
                        <Star
                          className={
                            "size-9 transition-colors " +
                            ((hover || rating) >= n
                              ? "fill-[var(--amber)] text-[var(--amber)]"
                              : "text-border")
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="text-sm font-600">What's this about?</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FEEDBACK_TOPICS.map((t) => {
                      const active = topic === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setTopic(t)}
                          className={
                            "rounded-full px-4 py-2 text-sm font-600 transition-all " +
                            (active
                              ? "bg-foreground text-background"
                              : "border border-border/70 bg-background text-muted-foreground hover:text-foreground")
                          }
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-600">Your message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                    rows={4}
                    placeholder="Tell us what you think…"
                    className="mt-2 w-full resize-none rounded-2xl border border-border/70 bg-background p-4 outline-none focus:border-primary"
                  />
                  <div className="mt-1 text-right text-xs text-muted-foreground">
                    {message.length}/500
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-600">
                    Your name <span className="font-400 text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    placeholder="Anonymous"
                    className="mt-2 w-full rounded-2xl border border-border/70 bg-background p-3 outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={!canSend}
                  className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display text-lg font-600 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="size-5" /> Send feedback
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent feedback on this device */}
        {recent.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-700">Your recent notes</h3>
            <div className="mt-3 space-y-3">
              {recent.slice(0, 5).map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-border/70 bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={
                              "size-4 " +
                              (f.rating >= n
                                ? "fill-[var(--amber)] text-[var(--amber)]"
                                : "text-border")
                            }
                          />
                        ))}
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-600 text-muted-foreground">
                        {f.topic}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(f.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{f.message}</p>
                  {f.name && (
                    <p className="mt-1 text-xs text-muted-foreground">— {f.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
