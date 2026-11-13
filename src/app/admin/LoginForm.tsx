"use client";

import { useState } from "react";
import { FiLock } from "react-icons/fi";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) window.location.reload();
    else { setError(json.error || "Erro ao entrar."); setLoading(false); }
  };

  return (
    <main className="min-h-svh flex items-center justify-center px-5">
      <form onSubmit={submit} className="panel rounded-2xl p-7 w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <FiLock /> <h1 className="text-xl font-extrabold text-[var(--text)]">Painel</h1>
        </div>
        <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha" className="field" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading || !password} className="btn-primary py-3">{loading ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
