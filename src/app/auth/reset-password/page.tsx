"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [done, setDone]                 = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 8) { setError("Minimum 8 caractères."); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError("Lien expiré ou invalide. Recommencez depuis la page de connexion."); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.625rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.875rem",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    marginBottom: "0.375rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1025 0%, #08070d 60%, #050508 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Image src="/logo.svg" alt="Agence de l'Ombre" width={32} height={32} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">Nouveau mot de passe</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Choisissez un mot de passe sécurisé</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>
          {done ? (
            <div className="text-center space-y-3 py-2">
              <CheckCircle2 size={36} className="mx-auto text-green-400" />
              <p className="text-white font-semibold text-sm">Mot de passe mis à jour</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Redirection vers la connexion…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(252,165,165)" }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, rgb(139,92,246) 0%, rgb(109,40,217) 100%)", color: "white" }}>
                {loading && <Loader2 size={15} className="animate-spin" />}
                Enregistrer
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
