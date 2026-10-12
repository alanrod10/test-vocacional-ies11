import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  BarChart3,
  Download,
  RotateCcw,
  ShieldCheck,
  Users,
  HeartPulse,
  Sparkles,
  Award,
  LogOut,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { HISTORICAL_ARCHIVE } from "@shared/archive";

const AREA_META: Record<string, { label: string; color: string }> = {
  "Tecnología e Innovación": { label: "Tecnología e Innovación", color: "#1976b7" },
  "Salud y Bienestar": { label: "Salud y Bienestar", color: "#10a979" },
  "Gestión, Sociedad y Humanidades": { label: "Gestión, Sociedad y Humanidades", color: "#f3a737" },
  "Producción, Diseño y Creatividad": { label: "Producción, Diseño y Creatividad", color: "#c55337" },
};

const chartColors = ["#1976b7", "#10a979", "#f3a737", "#c55337", "#75cff7", "#248277"];

function splitName(name: string) {
  return name.replace(/^TS en /, "");
}

function saveCsvFile(data: { content: string; filename: string }) {
  const blob = new Blob([data.content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = data.filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const meQuery = trpc.adminAuth.me.useQuery();
  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      toast.success("Sesión cerrada correctamente.");
      setLocation("/admin/login");
    },
  });

  const [selectedCatalogVersion, setSelectedCatalogVersion] = useState<string | null>(null);

  const analytics = trpc.vocational.analytics.useQuery(
    selectedCatalogVersion ? { catalogVersion: selectedCatalogVersion } : undefined,
    {
      enabled: !!meQuery.data,
      refetchInterval: 30_000,
    }
  );

  const exportCsv = trpc.vocational.exportCsv.useMutation();
  const createResetChallenge = trpc.vocational.createResetChallenge.useMutation();
  const resetResults = trpc.vocational.reset.useMutation({
    onSuccess: (data) => {
      toast.success(`Se reiniciaron las métricas. Registros eliminados: ${data.deleted}`);
      analytics.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Error al reiniciar métricas.");
    },
  });

  const deleteAssessment = trpc.vocational.deleteAssessment.useMutation({
    onSuccess: (data) => {
      toast.success(`Evaluación #${data.id} eliminada correctamente.`);
      analytics.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Error al eliminar la evaluación.");
    },
  });

  // Redirigir al login si no está autenticado
  if (!meQuery.isLoading && !meQuery.data) {
    setLocation("/admin/login");
    return null;
  }

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#edf6fc]">
        <div className="flex items-center gap-3 text-[#155f98]">
          <Loader2 className="animate-spin" size={24} />
          <span className="font-display font-bold">Verificando credenciales…</span>
        </div>
      </div>
    );
  }

  const currentUser = meQuery.data!;
  const isAdmin = currentUser.role === "admin";

  const handleExport = async () => {
    if (!isAdmin) {
      toast.error("La exportación requiere rol de administrador.");
      return;
    }
    try {
      const data = await exportCsv.mutateAsync();
      saveCsvFile(data);
      toast.success("CSV completo descargado exitosamente.");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo generar la exportación.");
    }
  };

  const handleReset = async () => {
    if (!isAdmin) {
      toast.error("El reinicio requiere rol de administrador.");
      return;
    }
    if (HISTORICAL_ARCHIVE.enabled) {
      toast.error("El reinicio está bloqueado en modo histórico.");
      return;
    }

    const firstConfirm = window.confirm(
      "Primera confirmación: ¿estás seguro de reiniciar TODOS los resultados acumulados?"
    );
    if (!firstConfirm) return;

    try {
      // 1. Descargar copia de respaldo obligatoria
      toast.info("Descargando copia de seguridad obligatoria antes de reiniciar…");
      const backup = await exportCsv.mutateAsync();
      saveCsvFile(backup);
      toast.success("Copia de seguridad guardada.");

      // 2. Generar challenge de reinicio
      const { challenge } = await createResetChallenge.mutateAsync();

      // 3. Segunda confirmación definitiva
      const secondConfirm = window.confirm(
        "Segunda confirmación: la copia de seguridad ya fue descargada. ¿Confirmás la eliminación permanente de todas las evaluaciones?"
      );
      if (secondConfirm) {
        await resetResults.mutateAsync({
          challenge,
          backupReceipt: backup.backupReceipt,
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "Error durante el proceso de reinicio.");
    }
  };

  const handleDeleteIndividual = async () => {
    if (!isAdmin) {
      toast.error("El borrado requiere rol de administrador.");
      return;
    }
    if (HISTORICAL_ARCHIVE.enabled) {
      toast.error("El borrado individual está bloqueado en modo histórico.");
      return;
    }
    const idInput = window.prompt("Ingresá el ID numérico de la evaluación a suprimir (derecho al olvido / privacidad):");
    if (!idInput) return;
    const id = parseInt(idInput.trim(), 10);
    if (!id || isNaN(id) || id <= 0) {
      toast.error("El ID ingresado no es válido.");
      return;
    }
    const confirmed = window.confirm(`¿Confirmás la eliminación permanente e irreversible de la evaluación #${id}?`);
    if (confirmed) {
      deleteAssessment.mutate({ id });
    }
  };

  const catalogViews = analytics.data?.catalogViews ?? [];
  const defaultCatalogView =
    catalogViews.find((view: any) => view.version === "2026.08-oficial-18" && view.total > 0) ??
    catalogViews.find((view: any) => view.version === "2026.08-legado-19") ??
    catalogViews[0];

  const analyticsView =
    catalogViews.find((view: any) => view.version === selectedCatalogVersion) ??
    defaultCatalogView ??
    analytics.data;

  const isConsolidatedCatalogView = (analyticsView as any)?.isConsolidated === true;
  const ranking = analyticsView?.ranking ?? [];
  const areaData = analyticsView?.areaDistribution ?? [];
  const hasSafeDemographicSample = (analyticsView?.total ?? 0) >= 5;
  const ageData = hasSafeDemographicSample ? analyticsView?.ageDistribution ?? [] : [];
  const sexData = hasSafeDemographicSample ? analyticsView?.sexDistribution ?? [] : [];
  const localityData = hasSafeDemographicSample ? analyticsView?.localityDistribution ?? [] : [];
  const educationData = hasSafeDemographicSample ? analyticsView?.educationDistribution ?? [] : [];
  const topProgram = analyticsView?.topProgram;
  const visibleRanking = ranking.map((item: { program: string; count: number }) => ({
    ...item,
    short: splitName(item.program),
  }));
  const visibleTopThreeRanking = (analyticsView?.topThreeRanking ?? []).map(
    (item: { program: string; count: number; first: number; second: number; third: number }) => ({
      ...item,
      short: splitName(item.program),
    })
  );
  const displayTop = topProgram?.count ? splitName(topProgram.program) : "Aún sin datos";

  return (
    <div className="min-h-screen bg-[#edf6fc] text-[#102d54]">
      {/* Header Administrativo */}
      <header className="sticky top-0 z-30 border-b border-[#bfe8ff] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo-ies11-jujuy.jpg"
              alt="IES N.° 11 Jujuy"
              className="h-12 w-12 rounded-2xl border-2 border-[#4db5ed] object-cover shadow-[0_4px_0_#155c96]"
            />
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#1976b7]">
                Panel de Coordinación e Investigación
              </p>
              <h1 className="font-display text-lg font-black tracking-tight text-[#102d54]">
                IES N.° 11 · Jujuy
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-[#bfe8ff] bg-[#f5fbff] px-3.5 py-1.5 text-xs font-bold text-[#155f98] sm:flex sm:items-center sm:gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10a979]" />
              <span>{currentUser.username}</span>
              <span className="rounded-md bg-[#1976b7] px-1.5 py-0.5 text-[10px] uppercase text-white">
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={() => setLocation("/")}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-[#172124]/10 bg-white px-3.5 py-2 text-xs font-bold text-[#526064] transition hover:bg-[#f0f4f8] hover:text-[#102d54]"
            >
              <ArrowLeft size={14} /> Ir al Test Público
            </button>

            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl bg-[#fff0eb] px-3.5 py-2 text-xs font-bold text-[#c55337] transition hover:bg-[#ffe2d9]"
            >
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e7ecff] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#3155d4]">
              <BarChart3 size={14} />
              {HISTORICAL_ARCHIVE.enabled ? "Archivo histórico" : `En vivo ${analytics.isFetching ? "· Actualizando" : ""}`}
            </p>
            <h2 className="font-display text-4xl font-black tracking-[-0.05em] text-[#102d54] sm:text-5xl">
              Métricas y Estadísticas
            </h2>
            <p className="mt-2 text-sm text-[#526064]">
              Resultados agrupados de evaluaciones vocacionales del IES N.° 11.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {isAdmin ? (
              <>
                <button
                  onClick={handleExport}
                  disabled={exportCsv.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1976b7]/25 bg-white px-4 py-3 font-display font-extrabold text-[#155f98] shadow-sm transition hover:bg-[#f5fbff] disabled:opacity-60"
                >
                  <Download size={18} />
                  {exportCsv.isPending ? "Preparando CSV…" : "Exportar CSV completo"}
                </button>

                {!HISTORICAL_ARCHIVE.enabled && (
                  <>
                    <button
                      onClick={handleDeleteIndividual}
                      disabled={deleteAssessment.isPending}
                      title="Eliminar una evaluación específica por derecho al olvido / privacidad"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d84736]/40 bg-white px-4 py-3 font-display font-extrabold text-[#c55337] shadow-sm transition hover:bg-[#fff0eb] disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      {deleteAssessment.isPending ? "Eliminando…" : "Borrar por ID"}
                    </button>

                    <button
                      onClick={handleReset}
                      disabled={resetResults.isPending || createResetChallenge.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d84736] bg-white px-4 py-3 font-display font-extrabold text-[#c55337] shadow-sm transition hover:bg-[#fff0eb] disabled:opacity-50"
                    >
                      <RotateCcw size={18} />
                      {resetResults.isPending ? "Reiniciando…" : "Reiniciar métricas"}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[#fff8eb] px-4 py-2 text-xs font-bold text-[#8a611c]">
                <ShieldAlert size={16} /> Modo solo lectura (rol visualizador)
              </div>
            )}
          </div>
        </div>

        {analytics.isLoading ? (
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div className="h-44 animate-pulse rounded-[1.65rem] bg-white" key={item} />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-[1.65rem] bg-white" />
          </div>
        ) : (
          <>
            {/* Selector de Catálogo */}
            <div className="mb-5 rounded-2xl border border-[#d8ecfb] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#1976b7]">
                    Serie analítica
                  </p>
                  <p className="mt-1 font-bold text-[#102d54]">
                    {analyticsView?.label ?? "Catálogo de tecnicaturas"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#526064]">
                    {isConsolidatedCatalogView
                      ? "Esta vista suma resultados de ambos catálogos para una lectura histórica global."
                      : "Cada serie conserva su catálogo original (18 o 19 tecnicaturas)."}
                  </p>
                </div>

                {catalogViews.length > 1 && (
                  <select
                    aria-label="Seleccionar versión de catálogo"
                    value={selectedCatalogVersion ?? analyticsView?.version ?? ""}
                    onChange={(e) => setSelectedCatalogVersion(e.target.value)}
                    className="min-h-[44px] rounded-xl border border-[#bfe8ff] bg-white px-3 py-2 text-sm font-bold text-[#155f98] outline-none focus:ring-4 focus:ring-[#1976b7]/15"
                  >
                    {catalogViews.map((view: any) => (
                      <option key={view.version} value={view.version}>
                        {view.label} · {view.total} casos
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isConsolidatedCatalogView && (
                <div className="mt-3 flex gap-2 rounded-xl border border-[#f2d5a5] bg-[#fff9ec] px-3 py-2 text-xs leading-relaxed text-[#745218]">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#745218]" size={15} />
                  <p>
                    <strong>Lectura histórica consolidada:</strong> incluye las evaluaciones de
                    ambas versiones del catálogo.
                  </p>
                </div>
              )}
            </div>

            {/* Tarjetas KPI */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Evaluaciones completadas"
                value={analyticsView?.total ?? 0}
                icon={<Users size={20} />}
                tone="coral"
              />
              <KpiCard
                label="Frecuencia de empates"
                value={analyticsView?.total ? `${(analyticsView as any)?.tieRate ?? 0}% (${(analyticsView as any)?.tieCount ?? 0})` : "—"}
                icon={<Award size={20} />}
                tone="blue"
              />
              <KpiCard
                label="Edad promedio"
                value={hasSafeDemographicSample ? `${analyticsView?.averageAge} años` : "—"}
                icon={<HeartPulse size={20} />}
                tone="blue"
              />
              <KpiCard
                label="Tecnicatura más afín"
                value={displayTop}
                icon={<Sparkles size={20} />}
                tone="green"
                small
              />
            </div>

            {/* Ranking y Distribución por Áreas */}
            {!analyticsView?.total ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-[#cdd5d2] bg-white p-12 text-center shadow-sm">
                <Users size={32} className="mx-auto text-[#1976b7]" />
                <h3 className="mt-3 font-display text-xl font-extrabold text-[#102d54]">
                  Aún no se registran evaluaciones para esta serie
                </h3>
                <p className="mt-1 text-sm text-[#526064]">
                  Los datos aparecerán aquí tan pronto como los participantes completen el test.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
                {/* Ranking de Carreras */}
                <div className="rounded-[1.65rem] border border-white bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-extrabold text-[#102d54]">
                    Ranking de Carreras ({analyticsView?.programCount ?? ranking.length})
                  </h3>
                  <p className="mb-4 text-xs font-semibold text-[#526064]">
                    Frecuencia de afinidad número uno por tecnicatura
                  </p>
                  <div className="h-[650px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={visibleRanking}
                        layout="vertical"
                        margin={{ left: 4, right: 20, top: 10, bottom: 0 }}
                      >
                        <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="short"
                          width={140}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fontWeight: 700, fill: "#526064" }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 16,
                            border: "none",
                            boxShadow: "0 12px 28px rgba(23,33,36,.14)",
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#406bff">
                          {visibleRanking.map((item: any) => (
                            <Cell
                              key={item.program}
                              fill={AREA_META[item.area as keyof typeof AREA_META]?.color ?? "#406bff"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráficos Secundarios */}
                <div className="grid gap-6">
                  {/* Áreas Vocacionales */}
                  <div className="rounded-[1.65rem] border border-white bg-white p-6 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold text-[#102d54]">
                      Áreas Vocacionales
                    </h3>
                    <p className="mb-3 text-xs font-semibold text-[#526064]">
                      Distribución porcentual por área del conocimiento
                    </p>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={areaData}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                          >
                            {areaData.map((item: any) => (
                              <Cell
                                key={item.label}
                                fill={
                                  AREA_META[item.label as keyof typeof AREA_META]?.color ??
                                  "#406bff"
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 16, border: "none" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid gap-1.5 pt-2">
                      {areaData.map((item: any) => (
                        <div
                          className="flex items-center justify-between text-xs font-bold"
                          key={item.label}
                        >
                          <span className="flex items-center gap-2 text-[#526064]">
                            <i
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                background:
                                  AREA_META[item.label as keyof typeof AREA_META]?.color,
                              }}
                            />
                            {item.label}
                          </span>
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demográficos */}
                  <div className="rounded-[1.65rem] border border-white bg-white p-6 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold text-[#102d54]">
                      Grupos de Edad
                    </h3>
                    <p className="mb-3 text-xs font-semibold text-[#526064]">
                      {hasSafeDemographicSample
                        ? "Distribución por rangos etarios (S6: N<3 suprimido)"
                        : "Requiere al menos 5 respuestas para proteger la privacidad"}
                    </p>
                    <SimpleBarsList
                      data={ageData}
                      colors={["#10a979", "#1976b7", "#f3a737", "#c55337"]}
                    />
                  </div>

                  <div className="rounded-[1.65rem] border border-white bg-white p-6 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold text-[#102d54]">
                      Identidad de Género / Sexo
                    </h3>
                    <p className="mb-3 text-xs font-semibold text-[#526064]">
                      {hasSafeDemographicSample
                        ? "Distribución por género (S6: N<3 suprimido)"
                        : "Requiere al menos 5 respuestas"}
                    </p>
                    <SimpleBarsList
                      data={sexData}
                      colors={["#406bff", "#10a979", "#f3a737"]}
                    />
                  </div>

                  <div className="rounded-[1.65rem] border border-white bg-white p-6 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold text-[#102d54]">
                      Situación Educativa
                    </h3>
                    <p className="mb-3 text-xs font-semibold text-[#526064]">
                      {hasSafeDemographicSample
                        ? "Contexto de los participantes (S6: N<3 suprimido)"
                        : "Requiere al menos 5 respuestas para proteger la privacidad"}
                    </p>
                    <SimpleBarsList
                      data={educationData}
                      colors={["#406bff", "#10a979", "#f3a737", "#c55337"]}
                    />
                  </div>

                  <div className="rounded-[1.65rem] border border-white bg-white p-6 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold text-[#102d54]">
                      Localidad de Origen
                    </h3>
                    <p className="mb-3 text-xs font-semibold text-[#526064]">
                      {hasSafeDemographicSample
                        ? "Distribución geográfica (S6: N<3 suprimido)"
                        : "Requiere al menos 5 respuestas"}
                    </p>
                    <SimpleBarsList
                      data={localityData}
                      colors={["#1976b7", "#75cff7", "#10a979", "#f3a737"]}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
  small = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "coral" | "blue" | "green";
  small?: boolean;
}) {
  const color =
    tone === "coral"
      ? "bg-[#dff3ff] text-[#1976b7]"
      : tone === "blue"
      ? "bg-[#e7ecff] text-[#406bff]"
      : "bg-[#dff7ef] text-[#08714d]";
  return (
    <div className="rounded-[1.65rem] border border-white bg-white p-5 shadow-sm">
      <div className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${color}`}>{icon}</div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-[#637073]">{label}</p>
      <p
        className={`mt-1 font-display font-black tracking-[-0.04em] text-[#172124] ${
          small ? "text-xl leading-tight" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SimpleBarsList({
  data,
  colors,
}: {
  data: { label: string; value: number }[];
  colors: string[];
}) {
  if (!data.length) {
    return (
      <div className="flex min-h-16 items-center gap-2 rounded-xl bg-[#f5fbff] px-3 text-xs text-[#526064]">
        <ShieldCheck className="shrink-0 text-[#1976b7]" size={16} />
        Datos no disponibles aún.
      </div>
    );
  }
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-3 pt-1">
      {data.map((item, index) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs font-bold">
            <span className="text-[#526064]">{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-[#ebeeeb]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                background: colors[index % colors.length],
                width: `${(item.value / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
