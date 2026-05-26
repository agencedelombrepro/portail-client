"use client";

import { useState } from "react";
import { login, resetPassword } from "./actions";
import { Eye, EyeOff, Loader2, ArrowLeft, MailCheck } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [mode, setMode]                   = useState<"login" | "forgot" | "sent">("login");
  const [resetEmail, setResetEmail]       = useState("");

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("email", resetEmail);
    const result = await resetPassword(fd);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    setMode("sent");
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
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    marginBottom: "0.375rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  if (mode === "sent") {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <MailCheck size={22} style={{ color: "rgb(167,139,250)" }} />
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Email envoyé</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
          </p>
        </div>
        <button
          onClick={() => { setMode("login"); setError(null); }}
          className="text-xs flex items-center gap-1.5 mx-auto transition-colors"
          style={{ color: "rgba(167,139,250,0.8)" }}
        >
          <ArrowLeft size={12} /> Retour à la connexion
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <p className="text-white font-semibold text-sm mb-1">Mot de passe oublié</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="vous@exemple.fr"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{ background: "rgb(139,92,246)", color: "white" }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Envoyer le lien
        </button>

        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
          className="w-full flex items-center justify-center gap-1.5 text-xs transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <ArrowLeft size={12} /> Retour à la connexion
        </button>
      </form>
    );
  }

  return (
    <form action={handleLogin} className="space-y-5">
      <div>
        <label style={labelStyle}>Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.fr"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      <div>
        <label style={labelStyle}>Mot de passe</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ ...inputStyle, paddingRight: "2.5rem" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(252,165,165)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, rgb(139,92,246) 0%, rgb(109,40,217) 100%)", color: "white", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => { setMode("forgot"); setError(null); }}
          className="text-xs transition-colors hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Mot de passe oublié ?
        </button>
      </div>
    </form>
  );
}
