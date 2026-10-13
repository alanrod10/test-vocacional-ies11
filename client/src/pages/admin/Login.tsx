import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Lock, User, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const meQuery = trpc.adminAuth.me.useQuery();
  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Bienvenido, ${data.user.username} (${data.user.role})`);
      meQuery.refetch();
      setLocation("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "Credenciales incorrectas.");
    },
  });

  // Si ya tiene sesión activa, redirigir directo al dashboard
  if (meQuery.data) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Por favor completá todos los campos.");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#edf6fc] px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img
            src="/logo-ies11-jujuy.jpg"
            alt="IES N.° 11 Jujuy"
            className="mx-auto h-16 w-16 rounded-2xl border-2 border-[#4db5ed] object-cover shadow-[0_6px_0_#155c96]"
          />
          <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-[#102d54]">
            Panel de Coordinación
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#1976b7]">
            Instituto de Educación Superior N.° 11
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#bfe8ff] bg-white p-8 shadow-[0_12px_40px_rgba(21,92,150,0.1)] sm:p-10">
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-[#f0f8ff] p-3 text-xs font-semibold text-[#155f98]">
            <ShieldCheck size={18} className="shrink-0 text-[#1976b7]" />
            <span>Acceso restringido para coordinadores y visualizadores.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#526064]"
              >
                Usuario
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#1976b7]">
                  <User size={18} />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. admin"
                  className="w-full rounded-2xl border border-[#bfe8ff] bg-[#f8fcff] py-3 pl-11 pr-4 text-sm font-bold text-[#102d54] outline-none transition focus:border-[#1976b7] focus:bg-white focus:ring-4 focus:ring-[#1976b7]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#526064]"
              >
                Contraseña
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#1976b7]">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-[#bfe8ff] bg-[#f8fcff] py-3 pl-11 pr-4 text-sm font-bold text-[#102d54] outline-none transition focus:border-[#1976b7] focus:bg-white focus:ring-4 focus:ring-[#1976b7]/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1976b7] px-5 py-3.5 font-display text-base font-extrabold text-white shadow-[0_5px_0_#155c96] transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Iniciando sesión…
                </>
              ) : (
                "Ingresar al Panel"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#edf6fc] pt-5 text-center">
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#526064] transition hover:text-[#1976b7]"
            >
              <ArrowLeft size={14} /> Volver al Test Vocacional
            </button>
          </div>
        </div>
      </div>
      <InstitutionalFooter />
    </div>
  );
}
