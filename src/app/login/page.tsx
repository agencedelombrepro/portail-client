import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1025 0%, #08070d 60%, #050508 100%)",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Faint radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-30" style={{ background: "rgba(139,92,246,0.4)" }} />
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Image src="/logo.svg" alt="Agence de l'Ombre" width={32} height={32} />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(167,139,250,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Accès restreint
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">Agence de l&apos;Ombre</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Portail privé · Espace équipe &amp; clients</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.02), 0 32px 64px rgba(0,0,0,0.5)",
          }}
        >
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} Agence de l&apos;Ombre — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
