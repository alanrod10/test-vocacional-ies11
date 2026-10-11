import { ALL_PROGRAMS, AREA_META, INSTITUTION_INFO, PROGRAMS, QUESTIONS } from "@shared/vocational";
import { HISTORICAL_ARCHIVE } from "@shared/archive";
import { trpc } from "@/lib/trpc";
import { downloadVocationalReport } from "@/lib/reportPdf";
import { buildResultShareUrl } from "@/lib/resultShare";
import { downloadSocialCardPng } from "@/lib/socialCardDownload";
import { buildSocialCardSummary } from "@/lib/socialCardSummary";
import { buildTopAffinityComparison } from "@/lib/topAffinityComparison";
import { ANSWER_CONFIRMATION_MS, QUESTION_EXIT_MS, type AnswerTransitionState } from "@/lib/answerTransition";
import { appendAnswer, resolveQuestionTransition } from "../lib/questionFlow";
import {
  ArrowLeft, ArrowRight, Award, BarChart3, Check, ChevronRight, GraduationCap,
  Download, FileText, HeartPulse, Lightbulb, MapPin, QrCode, RefreshCw, RotateCcw, ShieldCheck, Sparkles, Users,
} from "lucide-react";
import QRCode from "qrcode";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

type Sex = "Femenino" | "Masculino" | "Otro / Prefiero no decir";
type Stage = "register" | "test" | "result";
type ParticipantProfile = { firstName: string; lastName: string; age: string; sex: Sex | ""; locality: string; educationStatus: string; dataConsent: boolean };

const sexOptions: Sex[] = ["Femenino", "Masculino", "Otro / Prefiero no decir"];
const localityOptions = ["San Salvador de Jujuy", "Palpalá", "Perico", "El Carmen", "Libertador General San Martín", "Humahuaca / Quebrada", "Otra localidad de Jujuy", "Otra provincia o país", "Prefiero no indicarla"];
const educationOptions = ["Secundario: 4.º o 5.º año", "Secundario: último año", "Egresé del secundario", "Estudio o trabajo actualmente", "Otra situación educativa"];
const emptyParticipantProfile: ParticipantProfile = { firstName: "", lastName: "", age: "", sex: "", locality: "", educationStatus: "", dataConsent: false };
const chartColors = ["#fb6e4b", "#406bff", "#10a979", "#f1a429", "#c94d8c"];

function splitName(name: string) {
  const parts = name.replace("TS en ", "").split(" ");
  return parts.length > 3 ? `${parts.slice(0, 3).join(" ")}…` : name.replace("TS en ", "");
}

export default function Home() {
  const sharedProgram = new URLSearchParams(window.location.search).get("resultado");
  if (sharedProgram && ALL_PROGRAMS[sharedProgram]) return <SharedResultLanding programName={sharedProgram} profile={ALL_PROGRAMS[sharedProgram]} />;
  const [view, setView] = useState<"test" | "dashboard">(() => new URLSearchParams(window.location.search).get("view") === "dashboard" ? "dashboard" : "test");
  const [stage, setStage] = useState<Stage>("register");
  const [profile, setProfile] = useState<ParticipantProfile>(emptyParticipantProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<number[]>([]);
  const [displayQuestionIndex, setDisplayQuestionIndex] = useState(0);
  const [result, setResult] = useState<{ winner: { program: string; score: number; area: string }; topThree: { program: string; score: number; area: string }[] } | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [answerTransition, setAnswerTransition] = useState<AnswerTransitionState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const submit = trpc.vocational.submit.useMutation({
    onSuccess: (data) => {
      setResult({ winner: data.winner, topThree: data.topThree });
      setStage("result");
      setIsAdvancing(false);
      setAnswerTransition("idle");
      setSelectedAnswer(null);
      utils.vocational.analytics.invalidate();
      toast.success("Resultado guardado para la analítica del stand");
    },
    onError: (error) => {
      setIsAdvancing(false);
      setAnswerTransition("idle");
      setSelectedAnswer(null);
      toast.error(error.data?.code === "BAD_REQUEST"
        ? "Elegí al menos una actividad que te represente para calcular tu afinidad."
        : error.data?.code === "FORBIDDEN"
          ? "La participación de esta versión histórica finalizó."
        : "No se pudo guardar el resultado. Revisá la conexión e intentá de nuevo.");
    },
  });
  const analytics = trpc.vocational.analytics.useQuery(undefined, { enabled: view === "dashboard", refetchInterval: view === "dashboard" ? 10_000 : false });
  const exportCsv = trpc.vocational.exportCsv.useMutation();
  const createResetChallenge = trpc.vocational.createResetChallenge.useMutation();
  const resetResults = trpc.vocational.reset.useMutation({
    onSuccess: ({ deleted }) => {
      utils.vocational.analytics.invalidate();
      toast.success(`${deleted} resultado${deleted === 1 ? "" : "s"} eliminado${deleted === 1 ? "" : "s"}. El panel quedó en cero.`);
    },
    onError: (error) => {
      toast.error(error.data?.code === "UNAUTHORIZED" ? "La contraseña no es válida. No se modificó ningún dato." : "No se pudieron reiniciar los resultados.");
    },
  });

  const currentQuestion = QUESTIONS[displayQuestionIndex];
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const winnerProfile = result ? PROGRAMS[result.winner.program] : null;

  const validateProfile = () => {
    const next: Record<string, string> = {};
    if (profile.firstName.trim().length < 2) next.firstName = "Ingresá al menos 2 letras.";
    if (profile.lastName.trim().length < 2) next.lastName = "Ingresá al menos 2 letras.";
    const age = Number(profile.age);
    if (!Number.isInteger(age) || age < 13 || age > 99) next.age = "Ingresá una edad válida (13 a 99).";
    if (!profile.sex) next.sex = "Elegí una opción para continuar.";
    if (!profile.locality) next.locality = "Elegí una localidad o la opción de preferencia.";
    if (!profile.educationStatus) next.educationStatus = "Contanos tu situación educativa actual.";
    if (!profile.dataConsent) next.dataConsent = "Necesitamos tu consentimiento para guardar el resultado.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const startTest = () => {
    if (validateProfile()) setStage("test");
  };

  const chooseAnswer = (optionIndex: number) => {
    if (isAdvancing || submit.isPending) return;
    setSelectedAnswer(optionIndex);
    setAnswerTransition("selected");
    setIsAdvancing(true);
    const nextAnswers = appendAnswer(answers, optionIndex);
    window.setTimeout(() => {
      setAnswerTransition("leaving");
      window.setTimeout(() => {
        setAnswers(nextAnswers);
        const transition = resolveQuestionTransition(displayQuestionIndex, nextAnswers.length, QUESTIONS.length);
        if (transition.isComplete) {
          submit.mutate({
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
            age: Number(profile.age),
            sex: profile.sex as Sex,
            studyIntent: QUESTIONS[QUESTIONS.length - 1].options[nextAnswers[nextAnswers.length - 1]].label,
            locality: profile.locality,
            educationStatus: profile.educationStatus,
            dataConsent: profile.dataConsent,
            selections: nextAnswers,
          });
        } else {
          setDisplayQuestionIndex(transition.nextQuestionIndex);
          setSelectedAnswer(null);
          setAnswerTransition("idle");
          setIsAdvancing(false);
        }
      }, QUESTION_EXIT_MS);
    }, ANSWER_CONFIRMATION_MS);
  };

  const resetTest = () => {
    setStage("register");
    setProfile(emptyParticipantProfile);
    setErrors({});
    setAnswers([]);
    setDisplayQuestionIndex(0);
    setResult(null);
    setAnswerTransition("idle");
    setSelectedAnswer(null);
  };

  const saveCsvFile = (data: { content: string; filename: string }) => {
    const blob = new Blob([data.content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = data.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const requestReset = async () => {
    const firstConfirmation = window.confirm("Primera confirmación: ¿querés eliminar TODOS los resultados acumulados del panel?");
    if (!firstConfirmation) return;
    const password = window.prompt("Ingresá la contraseña privada para reiniciar las métricas:");
    if (!password) return;
    try {
      const backup = await exportCsv.mutateAsync({ password });
      saveCsvFile(backup);
      toast.success("Se descargó una copia de seguridad obligatoria antes del reinicio.");
      const { challenge } = await createResetChallenge.mutateAsync();
      const secondConfirmation = window.confirm("Segunda confirmación: la copia ya se descargó y esta acción no se puede deshacer. ¿Confirmás el reinicio definitivo?");
      if (secondConfirmation) resetResults.mutate({ challenge, password, backupReceipt: backup.backupReceipt });
    } catch {
      toast.error("No se pudo generar la copia de seguridad. No se modificó ningún resultado.");
    }
  };

  const downloadCompleteCsv = async () => {
    const password = window.prompt("Ingresá la contraseña privada para descargar el CSV completo:");
    if (!password) return;
    let data: { content: string; filename: string };
    try {
      data = await exportCsv.mutateAsync({ password });
    } catch {
      toast.error("No se pudo preparar el CSV. Intentá nuevamente.");
      return;
    }
    saveCsvFile(data);
    toast.success("Se descargó el CSV completo para coordinación.");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#edf6fc] text-[#102d54]">
      <Header view={view} setView={setView} onTestClick={() => { setView("test"); }} />
      <main className="relative mx-auto min-h-[calc(100vh-78px)] max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-[#75cff7]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-72 h-72 w-72 rounded-full bg-[#639ee8]/20 blur-3xl" />
        {view === "test" ? (
          <section className="relative mx-auto max-w-3xl">
            {HISTORICAL_ARCHIVE.enabled ? <HistoricalLanding onDashboard={() => setView("dashboard")} /> : <>
              {stage === "register" && <Registration profile={profile} setProfile={setProfile} errors={errors} onStart={startTest} />}
              {stage === "test" && currentQuestion && <QuestionStep key={currentQuestion.id} questionIndex={displayQuestionIndex} question={currentQuestion} transitionState={answerTransition} selectedAnswer={selectedAnswer} onChoose={chooseAnswer} onBack={() => { if (answerTransition !== "idle") return; if (!answers.length) setStage("register"); else { setAnswers((current) => current.slice(0, -1)); setDisplayQuestionIndex((current) => Math.max(0, current - 1)); } }} />}
              {stage === "result" && result && winnerProfile && <ResultStep name={displayName} participant={{ age: Number(profile.age) }} result={result} profile={winnerProfile} onReset={resetTest} onDashboard={() => setView("dashboard")} />}
            </>}
          </section>
        ) : (
          <Dashboard analytics={analytics.data} loading={analytics.isLoading} refreshing={analytics.isFetching} onReset={requestReset} resetBusy={resetResults.isPending || createResetChallenge.isPending} exporting={exportCsv.isPending} onExport={downloadCompleteCsv} archived={HISTORICAL_ARCHIVE.enabled} />
        )}
      </main>
      <InstitutionalFooter />
    </div>
  );
}

function HistoricalLanding({ onDashboard }: { onDashboard: () => void }) {
  return <div className="animate-rise mx-auto max-w-3xl py-8 sm:py-14"><div className="overflow-hidden rounded-[2rem] border border-[#bfe8ff] bg-white shadow-[0_18px_50px_rgba(21,92,150,0.14)]"><div className="bg-[#102d54] px-7 py-9 text-white sm:px-10"><p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#bfe8ff]"><ShieldCheck size={14} /> Archivo histórico cerrado</p><h1 className="mt-5 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">Una experiencia que <span className="text-[#75cff7]">dejó huella.</span></h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#dff3ff]">El Test Vocacional del IES N.° 11 fue realizado durante la Expo Educativa 2026. Esta versión conserva el trabajo, sus resultados agregados y la historia del proyecto.</p></div><div className="p-7 sm:p-10"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5fbff] p-4"><Award className="text-[#1976b7]" size={22} /><p className="mt-3 font-display font-extrabold">Experiencia finalizada</p><p className="mt-1 text-sm text-[#526064]">La participación pública ya concluyó.</p></div><div className="rounded-2xl bg-[#f5fbff] p-4"><BarChart3 className="text-[#1976b7]" size={22} /><p className="mt-3 font-display font-extrabold">Resultados preservados</p><p className="mt-1 text-sm text-[#526064]">Las estadísticas se mantienen en lectura.</p></div><div className="rounded-2xl bg-[#f5fbff] p-4"><GraduationCap className="text-[#1976b7]" size={22} /><p className="mt-3 font-display font-extrabold">Proyecto del IES N.° 11</p><p className="mt-1 text-sm text-[#526064]">Desarrollado por estudiantes de Ciencia de Datos e IA.</p></div></div><button onClick={onDashboard} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1976b7] px-5 py-4 font-display text-lg font-extrabold text-white shadow-[0_5px_0_#155c96] transition hover:-translate-y-0.5"><BarChart3 size={20} /> Ver estadísticas finales</button><p className="mt-5 text-center text-sm leading-relaxed text-[#526064]">El cuestionario y el reinicio de resultados están bloqueados para preservar esta versión histórica.</p></div></div></div>;
}

function Header({ view, setView, onTestClick }: { view: "test" | "dashboard"; setView: (value: "test" | "dashboard") => void; onTestClick: () => void }) {
  return <header className="sticky top-0 z-30 border-b border-[#bfe8ff] bg-[#edf6fc]/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <button onClick={onTestClick} className="group flex items-center gap-3 text-left" aria-label="Ir al inicio del test">
        <img src="/logo-ies11-jujuy.jpg" alt="Logo institucional IES N.° 11 Jujuy" className="h-12 w-12 rounded-2xl border-2 border-[#4db5ed] object-cover shadow-[0_6px_0_#155c96] transition-transform duration-150 group-active:translate-y-0.5" />
        <div className="leading-tight"><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#1976b7]">{HISTORICAL_ARCHIVE.enabled ? "Archivo histórico · Expo Educativa 2026" : "Expo Educativa 2026"}</p><p className="font-display text-lg font-extrabold tracking-tight">IES N.° 11 · Jujuy</p></div>
      </button>
      <nav className="flex rounded-2xl border border-[#172124]/10 bg-white/75 p-1 text-sm font-bold shadow-sm">
        <button onClick={() => setView("test")} className={`rounded-xl px-3 py-2 transition-all sm:px-4 ${view === "test" ? "bg-[#172124] text-white shadow-md" : "text-[#687577] hover:text-[#172124]"}`}>{HISTORICAL_ARCHIVE.enabled ? "Archivo" : "Mi test"}</button>
        <button onClick={() => setView("dashboard")} className={`rounded-xl px-3 py-2 transition-all sm:px-4 ${view === "dashboard" ? "bg-[#172124] text-white shadow-md" : "text-[#687577] hover:text-[#172124]"}`}>{HISTORICAL_ARCHIVE.enabled ? "Estadísticas" : "Panel"}</button>
      </nav>
    </div>
  </header>;
}

function Registration({ profile, setProfile, errors, onStart }: { profile: ParticipantProfile; setProfile: React.Dispatch<React.SetStateAction<ParticipantProfile>>; errors: Record<string, string>; onStart: () => void }) {
  const inputClass = "mt-1.5 w-full rounded-2xl border bg-white px-4 py-3.5 text-base font-medium outline-none transition focus:border-[#406bff] focus:ring-4 focus:ring-[#406bff]/15";
  return <div className="animate-rise grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
    <div className="pb-1"><p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#dff3ff] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#155f98]"><Sparkles size={14} /> Encontrá tu camino</p><h1 className="font-display text-5xl font-black leading-[0.94] tracking-[-0.055em] text-[#102d54] sm:text-6xl">Tu próxima<br /><span className="text-[#1976b7]">historia</span> empieza hoy.</h1><p className="mt-5 max-w-md text-lg leading-relaxed text-[#405f73]">Respondé situaciones reales y descubrí las Tecnicaturas Superiores del <strong>IES N.° 11</strong> con mayor afinidad con tus intereses.</p><div className="mt-8 flex items-center gap-4 text-sm font-semibold text-[#405f73]"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">{QUESTIONS.length}</span><span>preguntas claras · alrededor de 7 minutos</span></div><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#405f73]"><span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Sin respuestas correctas</span><span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Podés volver atrás</span><span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Resultado al finalizar</span></div><p className="mt-4 max-w-md text-sm leading-relaxed text-[#526064]">No es un examen ni reemplaza una decisión personal: es una guía inicial para conversar, comparar propuestas y explorar tu próximo paso.</p><QrAccessCard /></div>
    <div className="relative overflow-hidden rounded-[2rem] border border-[#d8ecfb] bg-white p-6 shadow-[0_18px_50px_rgba(21,92,150,0.14)] sm:p-8">
      <div className="absolute right-[-35px] top-[-36px] h-36 w-36 rounded-full bg-[#bfe8ff]" /><div className="relative"><div className="mb-6 flex items-center gap-3"><img src="/logo-ies11-jujuy.jpg" alt="IES N.° 11" className="h-11 w-11 rounded-xl object-cover shadow-sm" /><div><p className="font-display text-xl font-extrabold">Tu recorrido con el IES N.° 11</p><p className="text-sm text-[#5d7487]">Completá tus datos para iniciar</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre" error={errors.firstName}><input className={`${inputClass} ${errors.firstName ? "border-[#e45542]" : "border-[#dbe0df]"}`} value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} placeholder="Tu nombre" autoComplete="given-name" /></Field><Field label="Apellido" error={errors.lastName}><input className={`${inputClass} ${errors.lastName ? "border-[#e45542]" : "border-[#dbe0df]"}`} value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} placeholder="Tu apellido" autoComplete="family-name" /></Field></div>
        <Field label="Edad" error={errors.age}><input className={`${inputClass} ${errors.age ? "border-[#e45542]" : "border-[#dbe0df]"}`} value={profile.age} onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value.replace(/\D/g, "").slice(0, 2) }))} placeholder="Ej. 17" inputMode="numeric" /></Field>
        <Field label="Sexo" error={errors.sex}><div className="mt-2 grid gap-2"><div className="flex flex-wrap gap-2">{sexOptions.map((option) => <button type="button" key={option} onClick={() => setProfile((p) => ({ ...p, sex: option }))} className={`rounded-xl border px-3 py-2 text-sm font-bold transition-all ${profile.sex === option ? "border-[#172124] bg-[#172124] text-white" : "border-[#dbe0df] bg-white text-[#526064] hover:border-[#172124]/40"}`}>{option}</button>)}</div></div></Field>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Localidad" error={errors.locality}><select className={`${inputClass} ${errors.locality ? "border-[#e45542]" : "border-[#dbe0df]"}`} value={profile.locality} onChange={(e) => setProfile((p) => ({ ...p, locality: e.target.value }))}><option value="">Seleccioná una opción</option>{localityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></Field><Field label="Situación educativa" error={errors.educationStatus}><select className={`${inputClass} ${errors.educationStatus ? "border-[#e45542]" : "border-[#dbe0df]"}`} value={profile.educationStatus} onChange={(e) => setProfile((p) => ({ ...p, educationStatus: e.target.value }))}><option value="">Seleccioná una opción</option>{educationOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></Field></div>
        <div className={`consent-notice mt-5 rounded-2xl border p-4 ${errors.dataConsent ? "border-[#e45542] bg-[#fff4f1]" : "border-[#bfe8ff] bg-[#f5fbff]"}`}><label className="flex cursor-pointer gap-3"><input type="checkbox" checked={profile.dataConsent} onChange={(e) => setProfile((p) => ({ ...p, dataConsent: e.target.checked }))} className="mt-1 h-5 w-5 shrink-0 accent-[#1976b7]" /><span className="text-sm leading-relaxed text-[#405f73]"><strong className="text-[#102d54]">Autorizo el uso institucional de mis datos.</strong> El IES N.° 11 guardará mi nombre, apellido y respuestas en una base protegida. La página pública solo muestra estadísticas agrupadas; la descarga completa requiere la contraseña de coordinación.</span></label>{errors.dataConsent && <span className="mt-2 block text-xs font-medium text-[#d84736]">{errors.dataConsent}</span>}</div>
        <button onClick={onStart} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1976b7] px-5 py-4 font-display text-lg font-extrabold text-white shadow-[0_5px_0_#155c96] transition duration-150 hover:-translate-y-0.5 hover:bg-[#155f98] active:translate-y-1 active:shadow-none">Comenzar mi test <ArrowRight size={20} /></button><p className="mt-3 text-center text-xs leading-relaxed text-[#687577]">Tus datos identificatorios se resguardan para uso institucional. El panel público nunca los muestra.</p>
      </div>
    </div>
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="mt-4 block text-sm font-extrabold text-[#334043]">{label}{children}{error && <span className="mt-1 block text-xs font-medium text-[#d84736]">{error}</span>}</label>; }

function QrAccessCard() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const publicTestUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (!publicTestUrl) return;
    void QRCode.toDataURL(publicTestUrl, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#102D54", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [publicTestUrl]);

  return <aside className="qr-access-card mt-7 flex max-w-md items-center gap-4 rounded-[1.5rem] border border-[#bfe8ff] bg-white/85 p-3.5 shadow-sm">
    <div className="grid h-[82px] w-[82px] shrink-0 place-items-center overflow-hidden rounded-xl border border-[#d9e6ee] bg-white p-1.5">
      {qrDataUrl ? <img src={qrDataUrl} alt="Código QR para acceder al Test Vocacional del IES N.° 11" className="h-full w-full" /> : <QrCode className="text-[#1976b7]" aria-hidden="true" />}
    </div>
    <div><p className="font-display text-base font-extrabold text-[#102d54]">Escaneá y empezá</p><p className="mt-1 text-sm leading-snug text-[#526064]">Compartí este QR en el stand para ingresar al test desde cualquier celular.</p><a href={publicTestUrl} className="mt-2 inline-flex text-xs font-extrabold text-[#1976b7] underline underline-offset-2">Abrir el test</a></div>
  </aside>;
}

function QuestionStep({ questionIndex, question, transitionState, selectedAnswer, onChoose, onBack }: { questionIndex: number; question: (typeof QUESTIONS)[number]; transitionState: AnswerTransitionState; selectedAnswer: number | null; onChoose: (index: number) => void; onBack: () => void }) {
  const pct = ((questionIndex + 1) / QUESTIONS.length) * 100;
  const [sliderValue, setSliderValue] = useState(5);
  const modeLabel = question.mode === "slider" ? "Escala de preferencia" : question.mode === "binary" ? "Elegí la opción más cercana" : question.mode === "preference" ? "Tu preferencia" : "Escenario";
  const isLocked = transitionState !== "idle";
  return <div className={`question-step ${transitionState === "selected" ? "question-step-answering" : ""} ${transitionState === "leaving" ? "question-step-leaving" : ""}`}><div className="mb-5 flex items-center justify-between"><button onClick={onBack} disabled={isLocked} className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-bold text-[#566366] transition hover:bg-white disabled:opacity-50"><ArrowLeft size={18} /> Atrás</button><p className="font-display text-sm font-extrabold text-[#526064]" aria-live="polite">Pregunta <span className="text-[#1976b7]">{questionIndex + 1}</span> de {QUESTIONS.length}</p></div><div className="mb-8 rounded-2xl border border-[#cfe8f8] bg-white/75 p-3.5 shadow-sm"><div className="mb-2.5 flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.12em] text-[#526064]"><span>Tu avance</span><span className="text-[#1976b7]">{Math.round(pct)}% completado</span></div><div className="h-3 overflow-hidden rounded-full bg-[#dcebf6]" role="progressbar" aria-label="Progreso del test" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={questionIndex + 1} aria-valuetext={`Pregunta ${questionIndex + 1} de ${QUESTIONS.length}`}><div className="progress-fill h-full rounded-full bg-gradient-to-r from-[#155f98] via-[#1976b7] to-[#4db5ed]" style={{ width: `${pct}%` }} /></div><div className="mt-3 grid grid-cols-12 gap-1.5" aria-hidden="true">{QUESTIONS.map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-colors duration-300 ${index < questionIndex ? "bg-[#155f98]" : index === questionIndex ? "bg-[#4db5ed]" : "bg-[#dcebf6]"}`} />)}</div></div><article className="question-card overflow-hidden rounded-[2rem] bg-[#102d54] p-7 text-white shadow-[0_18px_50px_rgba(16,45,84,0.24)] sm:p-10"><div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#75cff7] font-display text-3xl font-black text-[#102d54]">{question.icon}</div><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#bfe8ff]">{question.institutional ? "Tu próximo paso" : modeLabel}</p><h1 className="font-display text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">{question.prompt}</h1><p className="mt-4 text-sm font-semibold leading-relaxed text-[#d8efff]">No hay respuestas correctas: elegí la opción que más se parece a vos.</p></article>{question.mode === "slider" ? <div className="question-options mt-5 rounded-[1.65rem] border border-[#d9e6ee] bg-white p-6 shadow-sm"><div className="mb-5 flex justify-between gap-4 text-sm font-bold text-[#526064]"><span>{question.sliderLabels?.min}</span><span>{question.sliderLabels?.max}</span></div><input aria-label="Escala de preferencia" aria-valuetext={`${sliderValue} de 10`} type="range" min="0" max="10" value={sliderValue} onChange={(event) => setSliderValue(Number(event.target.value))} className="ies-slider w-full" /><div className="mt-5 flex items-center justify-between"><span className="font-display text-3xl font-black text-[#1976b7]">{sliderValue}/10</span><button onClick={() => onChoose(sliderValue)} disabled={isLocked} className={`inline-flex items-center gap-2 rounded-2xl bg-[#1976b7] px-5 py-3 font-display font-extrabold text-white shadow-[0_4px_0_#155c96] disabled:opacity-70 ${selectedAnswer !== null ? "answer-option-selected" : ""}`}>{selectedAnswer !== null ? <Check size={18} /> : <ArrowRight size={18} />}{selectedAnswer !== null ? "Respuesta elegida" : "Confirmar"}</button></div></div> : <div className={`question-options mt-5 grid gap-3 ${question.mode === "binary" ? "sm:grid-cols-2" : ""}`}>{question.options.map((option, index) => <button key={option.label} disabled={isLocked} onClick={() => onChoose(index)} className={`group flex min-h-[74px] items-center gap-4 rounded-2xl border border-[#d9e6ee] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#1976b7] hover:shadow-md active:translate-y-0 disabled:opacity-75 ${selectedAnswer === index ? "answer-option-selected" : ""}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf7fd] font-display text-sm font-black text-[#1976b7] transition-colors group-hover:bg-[#1976b7] group-hover:text-white">{selectedAnswer === index ? <Check size={17} strokeWidth={3} /> : String.fromCharCode(65 + index)}</span><span className="flex-1 text-[15px] font-bold leading-snug text-[#334043]">{option.label}</span><ChevronRight className="shrink-0 text-[#8da6b7] group-hover:text-[#1976b7]" size={19} /></button>)}</div>}</div>;
}

function ResultStep({ name, participant, result, profile, onReset, onDashboard }: { name: string; participant: { age: number }; result: { winner: { program: string; score: number; area: string }; topThree: { program: string; score: number; area: string }[] }; profile: typeof PROGRAMS[string]; onReset: () => void; onDashboard: () => void }) {
  const meta = AREA_META[result.winner.area as keyof typeof AREA_META];
  const topMax = Math.max(...result.topThree.map((item) => item.score));
  const comparisonRows = buildTopAffinityComparison(result.topThree);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareQr, setShareQr] = useState("");
  const shareCardRef = useRef<HTMLDivElement>(null);
  const shareUrl = useMemo(() => buildResultShareUrl(window.location.origin, result.winner.program), [result.winner.program]);
  useEffect(() => { void QRCode.toDataURL(shareUrl, { width: 360, margin: 1, errorCorrectionLevel: "M", color: { dark: "#102D54", light: "#FFFFFF" } }).then(setShareQr).catch(() => setShareQr("")); }, [shareUrl]);
  const handlePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadVocationalReport({ participant: { name, age: participant.age }, winner: result.winner, topThree: result.topThree, profile });
      toast.success("Tu informe PDF ya se descargó.");
    } catch {
      toast.error("No se pudo generar el PDF. Intentá nuevamente.");
    } finally { setIsGeneratingPdf(false); }
  };
  const downloadShareImage = async () => {
    if (!shareCardRef.current) return;
    setIsGeneratingImage(true);
    try {
      await downloadSocialCardPng(shareCardRef.current, result.winner.program);
      toast.success("Tu tarjeta ya se descargó. ¡Podés compartirla en tus redes!");
    } catch {
      toast.error("No se pudo generar la tarjeta. Intentá nuevamente.");
    } finally { setIsGeneratingImage(false); }
  };

  return (
    <div className="animate-rise">
      <div className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#dff7ef] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#08714d]"><Check size={14} strokeWidth={3} /> Test completado</span>
        <button onClick={onDashboard} className="text-sm font-bold text-[#406bff] hover:underline">Ver panel</button>
      </div>
      <section className="result-reveal result-reveal-premium relative overflow-hidden rounded-[2rem] bg-[#102d54] px-7 py-9 text-white shadow-[0_22px_60px_rgba(16,45,84,0.28)] sm:px-10">
        <div className="result-rays" /><div className="result-orbit result-orbit-one" /><div className="result-orbit result-orbit-two" />
        <div className="result-trajectory" aria-hidden="true"><span className="result-trajectory-line" /><span className="result-trajectory-dot result-trajectory-dot-one" /><span className="result-trajectory-dot result-trajectory-dot-two" /><span className="result-trajectory-dot result-trajectory-dot-three" /></div>
        <div className="result-confetti" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="relative grid gap-7 sm:grid-cols-[auto_1fr] sm:items-center"><div className="result-medallion" style={{ background: meta.color }}><Award size={40} strokeWidth={2.2} /><span>{meta.icon}</span></div><div><p className="result-kicker"><Sparkles size={15} aria-hidden="true" />Tu afinidad principal</p><p className="result-layer result-layer-one mt-3 text-base text-[#d8efff]">{name}, se iluminó tu afinidad exploratoria más alta</p><h1 className="result-title result-layer result-layer-two mt-3 max-w-2xl font-display text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">{result.winner.program.replace("TS en ", "")}</h1><div className="result-area-pill result-layer result-layer-three mt-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-extrabold ring-1 ring-white/20"><span>{meta.icon}</span>{result.winner.area}</div><p className="result-layer result-layer-four mt-4 flex items-center gap-2 text-sm font-semibold text-[#bfe8ff]"><img src="/logo-ies11-jujuy.jpg" alt="" className="h-5 w-5 rounded-full object-cover" />Una propuesta para explorar en el IES N.° 11</p></div></div>
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dff3ff] text-[#1976b7]"><Lightbulb size={20} /></span><h2 className="font-display text-xl font-extrabold">Tu perfil profesional</h2></div>
          <p className="leading-relaxed text-[#526064]">{profile.profile}</p>
          <div className="mt-5 rounded-2xl border border-[#d5eefa] bg-[#f8fcff] p-4"><p className="mb-2 text-sm font-extrabold text-[#102d54]">Cómo se ve este perfil en la práctica</p><p className="text-sm leading-relaxed text-[#405f73]">{profile.professionalProfile}</p></div>
          <div className="mt-5 rounded-2xl border border-[#bfe8ff] bg-[#f5fbff] p-4"><p className="mb-2 text-sm font-extrabold text-[#102d54]">¿Qué podrías hacer al finalizar?</p><p className="text-sm leading-relaxed text-[#405f73]">{profile.graduateRole}</p><ul className="mt-3 space-y-2">{profile.tasks.map((task) => <li key={task} className="flex gap-2 text-sm leading-relaxed text-[#526064]"><Check size={16} className="mt-0.5 shrink-0 text-[#1976b7]" strokeWidth={3} />{task}</li>)}</ul></div>
          <div className="mt-5"><p className="mb-3 text-sm font-extrabold text-[#102d54]">Materias y espacios principales</p><div className="flex flex-wrap gap-2">{profile.subjects.map((subject) => <span key={subject} className="rounded-full bg-[#eaf6ff] px-3 py-1.5 text-xs font-bold text-[#155f98]">{subject}</span>)}</div></div>
          <div className="mt-6 rounded-2xl bg-[#edf6fc] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#102d54]"><MapPin size={17} className="text-[#1976b7]" /> Campo laboral</div><p className="text-sm leading-relaxed text-[#526064]">{profile.field}</p></div>
        </div>
        <div className="rounded-[2rem] border border-white bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7ecff] text-[#406bff]"><BarChart3 size={20} /></span><h2 className="font-display text-xl font-extrabold">Tus 3 afinidades</h2></div>
          <div className="space-y-5">{result.topThree.map((item, index) => <div key={item.program} className="result-affinity-row"><div className="mb-2 flex justify-between gap-2 text-sm font-bold"><span className="text-[#334043]"><span className="mr-2 text-[#c55337]">0{index + 1}</span>{splitName(item.program)}</span><span className="text-[#526064]">{item.score}/100</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#e9ebe6]"><div className="result-affinity-fill h-full rounded-full" style={{ width: `${Math.max(16, (item.score / topMax) * 100)}%`, backgroundColor: AREA_META[item.area as keyof typeof AREA_META].color }} /></div></div>)}</div>
          <p className="result-guidance mt-6 rounded-2xl bg-[#dff3ff] px-4 py-3 text-sm leading-relaxed text-[#155f98]">Este resultado es un punto de partida para explorar planes de estudio, hablar con docentes y comparar alternativas cercanas antes de decidir.</p>
        </div>
      </section>
      <section className="mt-5 overflow-hidden rounded-[1.65rem] border border-[#bfe8ff] bg-white shadow-sm"><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-lg font-extrabold text-[#102d54]">Conocé la propuesta del IES N.° 11</p><p className="mt-1 text-sm leading-relaxed text-[#526064]">{INSTITUTION_INFO.offer} {INSTITUTION_INFO.enrolment}</p></div><a href={INSTITUTION_INFO.website} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#1976b7] px-4 py-3 font-display font-extrabold text-white shadow-[0_4px_0_#155c96] transition hover:-translate-y-0.5"><ArrowRight size={18} /> Sitio institucional</a></div></section>
      {comparisonRows.length === 3 && (
        <section className="result-comparison mt-5 overflow-hidden rounded-[1.65rem] border border-[#cfeafb] bg-white shadow-sm">
          <div className="border-b border-[#dceef9] bg-[#f8fcff] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e7ecff] text-[#406bff]"><BarChart3 size={20} /></span><div><h2 className="font-display text-xl font-extrabold text-[#102d54]">Compará tus 3 afinidades</h2><p className="mt-1 text-sm leading-relaxed text-[#526064]">Mirá en qué se enfoca cada tecnicatura, sus materias clave y su posible campo laboral. No son opciones excluyentes: sirven para conversar y explorar con más información.</p></div></div>
          </div>
          <div className="space-y-3 px-5 py-4 sm:hidden">
            {comparisonRows.map((row) => <article key={row.program} className="comparison-card rounded-2xl border border-[#dceef9] bg-[#fbfdff] p-4"><div className="flex items-start gap-3"><span className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#102d54] text-xs font-black text-white">0{row.position}</span><div className="min-w-0 flex-1"><h3 className="font-display text-base font-extrabold leading-tight text-[#102d54]">{row.program.replace("TS en ", "")}</h3><div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e7f5ff] px-2.5 py-1 text-xs font-extrabold text-[#155f98]">{row.score}/100</span><span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#526064]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: AREA_META[row.area as keyof typeof AREA_META].color }} />{row.area}</span></div></div></div><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#526064]">En qué se enfoca</dt><dd className="mt-1 leading-relaxed text-[#405f73]">{row.focus}</dd></div><div><dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#526064]">Materias clave</dt><dd className="mt-1 flex flex-wrap gap-1.5">{row.subjects.map((subject) => <span key={subject} className="rounded-full bg-[#edf7fd] px-2 py-1 text-xs font-bold text-[#155f98]">{subject}</span>)}</dd></div><div><dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#526064]">Campo laboral</dt><dd className="mt-1 leading-relaxed text-[#405f73]">{row.field}</dd></div></dl></article>)}
          </div>
          <div className="hidden sm:block"><div className="overflow-x-auto px-5 pb-5 pt-3 sm:px-7" role="region" aria-label="Tabla comparativa de las tres afinidades principales" tabIndex={0}><table className="w-full min-w-[900px] border-separate border-spacing-0 text-left"><caption className="sr-only">Comparación de las tres tecnicaturas con mayor afinidad según tus respuestas.</caption><thead><tr className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#526064]"><th scope="col" className="border-b border-[#dceef9] px-3 py-3">Orden</th><th scope="col" className="border-b border-[#dceef9] px-3 py-3">Tecnicatura y afinidad</th><th scope="col" className="border-b border-[#dceef9] px-3 py-3">Área</th><th scope="col" className="border-b border-[#dceef9] px-3 py-3">En qué se enfoca</th><th scope="col" className="border-b border-[#dceef9] px-3 py-3">Materias clave</th><th scope="col" className="border-b border-[#dceef9] px-3 py-3">Campo laboral</th></tr></thead><tbody>{comparisonRows.map((row) => <tr key={row.program} className="comparison-row align-top text-sm text-[#405f73] even:bg-[#f9fcfe]"><td className="border-b border-[#e3f0f8] px-3 py-4"><span className="inline-grid h-8 w-8 place-items-center rounded-full bg-[#102d54] text-xs font-black text-white">0{row.position}</span></td><th scope="row" className="border-b border-[#e3f0f8] px-3 py-4 font-bold text-[#102d54]"><span className="block min-w-44">{row.program.replace("TS en ", "")}</span><span className="mt-2 inline-flex rounded-full bg-[#e7f5ff] px-2.5 py-1 text-xs font-extrabold text-[#155f98]">{row.score}/100</span></th><td className="border-b border-[#e3f0f8] px-3 py-4"><span className="inline-flex items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: AREA_META[row.area as keyof typeof AREA_META].color }} />{row.area}</span></td><td className="border-b border-[#e3f0f8] px-3 py-4 leading-relaxed"><p className="min-w-52 max-w-64">{row.focus}</p></td><td className="border-b border-[#e3f0f8] px-3 py-4"><div className="flex min-w-48 flex-wrap gap-1.5">{row.subjects.map((subject) => <span key={subject} className="rounded-full bg-[#edf7fd] px-2 py-1 text-xs font-bold text-[#155f98]">{subject}</span>)}</div></td><td className="border-b border-[#e3f0f8] px-3 py-4 leading-relaxed"><p className="min-w-56 max-w-72">{row.field}</p></td></tr>)}</tbody></table></div></div>
        </section>
      )}
      <section className="mt-5 overflow-hidden rounded-[1.65rem] border border-[#d8ecfb] bg-[#f5fbff] p-5 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#bfe8ff] bg-white p-2">{shareQr ? <img src={shareQr} alt="Código QR para abrir la tarjeta de resultado en el celular" className="h-full w-full" /> : <QrCode className="text-[#1976b7]" size={40} />}</div><div><p className="font-display text-lg font-extrabold text-[#102d54]">Llevá tu resultado al celular</p><p className="mt-1 text-sm leading-relaxed text-[#526064]">Escaneá este QR para abrir una tarjeta de tu tecnicatura recomendada y descargarla para compartir en redes.</p></div></div></section>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={handlePdf} disabled={isGeneratingPdf} className="flex items-center justify-center gap-2 rounded-2xl bg-[#102d54] px-5 py-3.5 font-display font-extrabold text-white shadow-[0_4px_0_#071a33] transition hover:-translate-y-0.5 disabled:opacity-60"><FileText size={18} /> {isGeneratingPdf ? "Generando informe…" : "Descargar informe PDF"}</button><button onClick={downloadShareImage} disabled={isGeneratingImage} className="flex items-center justify-center gap-2 rounded-2xl bg-[#1976b7] px-5 py-3.5 font-display font-extrabold text-white shadow-[0_4px_0_#155c96] transition hover:-translate-y-0.5 disabled:opacity-60"><Download size={18} /> {isGeneratingImage ? "Creando tarjeta…" : "Descargar tarjeta para redes"}</button><button onClick={onDashboard} className="flex items-center justify-center gap-2 rounded-2xl border border-[#1976b7]/20 bg-white px-5 py-3.5 font-display font-extrabold text-[#155f98] transition hover:border-[#1976b7]"><BarChart3 size={18} /> Ver analítica del stand</button><button onClick={onReset} className="flex items-center justify-center gap-2 rounded-2xl border border-[#102d54]/15 bg-white px-5 py-3.5 font-display font-extrabold text-[#102d54] transition hover:border-[#102d54] active:scale-[.98]"><RefreshCw size={18} /> Hacer otro test</button></div>
      <div className="pointer-events-none fixed left-[-10000px] top-0"><SocialResultCard ref={shareCardRef} programName={result.winner.program} profile={profile} name={name} /></div>
    </div>
  );
}

const SocialResultCard = React.forwardRef<HTMLDivElement, { programName: string; profile: typeof PROGRAMS[string]; name?: string }>(({ programName, profile, name }, ref) => {
  const meta = AREA_META[profile.area as keyof typeof AREA_META];
  return <div ref={ref} className="relative flex h-[1350px] w-[1080px] flex-col overflow-hidden bg-[#102d54] p-20 text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
    <div className="absolute -right-44 -top-28 h-[600px] w-[600px] rounded-full bg-[#1976b7]/40" /><div className="absolute -bottom-40 -left-24 h-[540px] w-[540px] rounded-full bg-[#75cff7]/20" />
    <div className="relative flex items-center gap-5"><img src="/logo-ies11-jujuy.jpg" alt="" className="h-24 w-24 rounded-[1.6rem] border-4 border-[#75cff7] object-cover" /><div><p className="text-2xl font-extrabold tracking-[0.16em] text-[#bfe8ff]">IES N.° 11 · JUJUY</p><p className="mt-1 text-3xl font-bold">{HISTORICAL_ARCHIVE.enabled ? "Expo Educativa 2026" : "Orientación Vocacional"}</p></div></div>
    <div className="relative my-auto"><p className="text-3xl font-extrabold tracking-[0.15em] text-[#bfe8ff]">MI RESULTADO VOCACIONAL</p><p className="mt-8 text-4xl font-bold text-[#d8efff]">{name ? `${name}, tu afinidad principal es` : "Tu afinidad principal es"}</p><h1 className="mt-8 text-8xl font-black leading-[0.94] tracking-[-0.06em]">{programName.replace("TS en ", "")}</h1><div className="mt-10 inline-flex items-center gap-3 rounded-full px-6 py-3 text-3xl font-extrabold" style={{ background: meta.color }}><span>{meta.icon}</span>{profile.area}</div><p className="mt-12 text-2xl font-extrabold tracking-[0.08em] text-[#bfe8ff]">PERFIL, EN BREVE</p><p className="mt-4 max-w-[830px] text-3xl leading-relaxed text-[#d8efff]">{buildSocialCardSummary(profile.graduateRole)}</p></div>
    <div className="relative border-t border-white/25 pt-8"><p className="text-2xl font-bold text-[#bfe8ff]">Test Vocacional · IES N.° 11</p><p className="mt-2 text-xl text-[#d8efff]">Explorá tu próximo paso con información y orientación.</p></div>
  </div>;
});
SocialResultCard.displayName = "SocialResultCard";

function SharedResultLanding({ programName, profile }: { programName: string; profile: typeof PROGRAMS[string] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadSocialCardPng(cardRef.current, programName);
      toast.success("La tarjeta se descargó correctamente.");
    } catch { toast.error("No se pudo descargar la tarjeta. Intentá nuevamente."); } finally { setDownloading(false); }
  };
  return <main className="min-h-screen bg-[#eaf6ff] px-4 py-8 sm:py-12"><div className="mx-auto max-w-md"><p className="mb-4 text-center text-sm font-extrabold uppercase tracking-[0.12em] text-[#155f98]">Tu resultado vocacional</p><div className="mx-auto h-[446px] w-full max-w-[400px] overflow-hidden rounded-[2rem] shadow-[0_18px_50px_rgba(16,45,84,0.2)] sm:h-[500px]"><div className="h-[1350px] w-[1080px] origin-top-left scale-[.33] sm:scale-[.37]"><SocialResultCard ref={cardRef} programName={programName} profile={profile} /></div></div><button onClick={downloadCard} disabled={downloading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1976b7] px-5 py-4 font-display text-lg font-extrabold text-white shadow-[0_5px_0_#155c96] transition hover:-translate-y-0.5 disabled:opacity-60"><Download size={20} /> {downloading ? "Creando tarjeta…" : "Descargar mi tarjeta"}</button><a href="/" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1976b7]/20 bg-white px-5 py-4 font-display font-extrabold text-[#155f98]">Volver al archivo histórico</a></div></main>;
}

function Dashboard({ analytics, loading, refreshing, onReset, resetBusy, exporting, onExport, archived }: { analytics: any; loading: boolean; refreshing: boolean; onReset: () => void; resetBusy: boolean; exporting: boolean; onExport: () => void; archived: boolean }) {
  const catalogViews = analytics?.catalogViews ?? [];
  const [selectedCatalogVersion, setSelectedCatalogVersion] = useState<string | null>(null);
  const defaultCatalogView = catalogViews.find((view: any) => view.version === "2026.08-oficial-18" && view.total > 0) ?? catalogViews.find((view: any) => view.version === "2026.08-legado-19") ?? catalogViews[0];
  const analyticsView = catalogViews.find((view: any) => view.version === selectedCatalogVersion) ?? defaultCatalogView ?? analytics;
  const isConsolidatedCatalogView = analyticsView?.isConsolidated === true;
  const ranking = analyticsView?.ranking ?? [];
  const areaData = analyticsView?.areaDistribution ?? [];
  const hasSafeDemographicSample = (analyticsView?.total ?? 0) >= 5;
  const ageData = hasSafeDemographicSample ? analyticsView?.ageDistribution ?? [] : [];
  const sexData = hasSafeDemographicSample ? analyticsView?.sexDistribution ?? [] : [];
  const localityData = hasSafeDemographicSample ? analyticsView?.localityDistribution ?? [] : [];
  const educationData = hasSafeDemographicSample ? analyticsView?.educationDistribution ?? [] : [];
  const topProgram = analyticsView?.topProgram;
  const visibleRanking = ranking.map((item: { program: string; count: number }) => ({ ...item, short: splitName(item.program) }));
  const visibleTopThreeRanking = (analyticsView?.topThreeRanking ?? []).map((item: { program: string; count: number; first: number; second: number; third: number }) => ({ ...item, short: splitName(item.program) }));
  const displayTop = topProgram?.count ? splitName(topProgram.program) : "Aún sin datos";
  const exportLabel = exporting ? "Preparando CSV…" : "Exportar CSV completo";

  return <section className="animate-rise relative">
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e7ecff] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#3155d4]"><BarChart3 size={14} /> {archived ? "Archivo histórico" : `En vivo ${refreshing ? "· Actualizando" : ""}`}</p><h1 className="font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">{archived ? <>Resultados de la <span className="text-[#c55337]">Expo.</span></> : <>Pulso del <span className="text-[#c55337]">stand.</span></>}</h1><p className="mt-2 text-[#526064]">{archived ? "Resultados finales agrupados de la Expo Educativa 2026, sin información identificatoria." : "Datos agrupados de la Expo Educativa 2026, sin información identificatoria."}</p></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button onClick={onExport} disabled={exporting} title="Solicita la contraseña privada de coordinación" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1976b7]/25 bg-white px-4 py-3.5 font-display font-extrabold text-[#155f98] transition hover:bg-[#f5fbff] disabled:opacity-60"><Download size={18} /> {exportLabel}</button>
        {!archived && <button onClick={onReset} disabled={resetBusy} title="Solicita dos confirmaciones antes de eliminar todos los resultados" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d84736] bg-white px-4 py-3.5 font-display font-extrabold text-[#c55337] transition hover:bg-[#fff0eb] disabled:opacity-50"><RotateCcw size={18} /> {resetBusy ? "Reiniciando…" : "Reiniciar resultados"}</button>}
      </div>
    </div>
    <div className="mb-5 flex gap-3 rounded-2xl border border-[#bfe8ff] bg-white/80 p-3.5 text-sm leading-relaxed text-[#405f73]"><ShieldCheck className="mt-0.5 shrink-0 text-[#1976b7]" size={18} /><p>{archived ? "Esta es una versión histórica cerrada: los resultados se conservan en lectura y el reinicio está bloqueado. El CSV completo sigue protegido por contraseña privada de coordinación." : "El CSV completo contiene datos identificatorios. La descarga y el reinicio solicitan la contraseña privada de coordinación del IES N.° 11."}</p></div>
    {loading ? <DashboardSkeleton /> : <>
      <div className="mb-5 rounded-2xl border border-[#d8ecfb] bg-[#f8fcff] p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#1976b7]">Serie analítica</p><p className="mt-1 font-bold text-[#102d54]">{analyticsView?.label ?? "Catálogo de tecnicaturas"}</p><p className="mt-1 text-xs leading-relaxed text-[#526064]">{isConsolidatedCatalogView ? "Esta vista suma resultados de ambos catálogos para una lectura histórica global." : "Cada serie conserva su catálogo original; no se mezclan afinidades calculadas con 19 y 18 tecnicaturas."}</p></div>{catalogViews.length > 1 && <select aria-label="Seleccionar versión de catálogo" value={selectedCatalogVersion ?? analyticsView?.version ?? ""} onChange={(event) => setSelectedCatalogVersion(event.target.value)} className="rounded-xl border border-[#bfe8ff] bg-white px-3 py-2 text-sm font-bold text-[#155f98] outline-none focus:ring-4 focus:ring-[#1976b7]/15">{catalogViews.map((view: any) => <option key={view.version} value={view.version}>{view.label} · {view.total} casos</option>)}</select>}</div>{isConsolidatedCatalogView && <div className="mt-3 flex gap-2 rounded-xl border border-[#f2d5a5] bg-[#fff9ec] px-3 py-2 text-xs leading-relaxed text-[#745218]"><ShieldCheck className="mt-0.5 shrink-0" size={15} /><p><strong>Lectura histórica:</strong> incluye las evaluaciones de las dos versiones. El perfil legado <em>Museología y Gestión Patrimonial</em> se conserva solo para interpretar registros anteriores y no integra la oferta oficial vigente de 18 tecnicaturas.</p></div>}</div>
      <div className="grid gap-4 sm:grid-cols-3"><Kpi label="Encuestados" value={analyticsView?.total ?? 0} icon={<Users size={20} />} tone="coral" /><Kpi label="Edad promedio" value={hasSafeDemographicSample ? `${analyticsView.averageAge} años` : "—"} icon={<HeartPulse size={20} />} tone="blue" /><Kpi label="Carrera más elegida" value={displayTop} icon={<Sparkles size={20} />} tone="green" small /></div>
      {!analyticsView?.total ? <div className="mt-5 rounded-[2rem] border border-dashed border-[#cdd5d2] bg-white/60 p-10 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#ffdf9c] text-[#7c5315]"><Users size={25} /></div><h2 className="mt-4 font-display text-2xl font-extrabold">Esta serie todavía no tiene resultados</h2><p className="mx-auto mt-2 max-w-md text-[#637073]">Cuando una persona complete el test con este catálogo, las estadísticas agrupadas aparecerán aquí automáticamente.</p></div> : <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.9fr]"><ChartCard title={`Ranking de las ${analyticsView?.programCount ?? ranking.length} tecnicaturas`} subtitle="Resultados obtenidos por carrera dentro de esta versión" className="min-h-[690px]"><ResponsiveContainer width="100%" height={650}><BarChart data={visibleRanking} layout="vertical" margin={{ left: 4, right: 20, top: 10, bottom: 0 }}><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="short" width={132} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#526064" }} /><Tooltip cursor={{ fill: "#f7f4ee" }} contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 28px rgba(23,33,36,.14)" }} /><Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#406bff">{visibleRanking.map((item: any) => <Cell key={item.program} fill={AREA_META[item.area as keyof typeof AREA_META].color} />)}</Bar></BarChart></ResponsiveContainer></ChartCard><div className="grid gap-5"><ChartCard title="Áreas vocacionales" subtitle="Distribución de afinidades"><div className="h-[235px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={areaData} dataKey="value" nameKey="label" innerRadius={62} outerRadius={92} paddingAngle={4}>{areaData.map((item: any) => <Cell key={item.label} fill={AREA_META[item.label as keyof typeof AREA_META]?.color ?? "#406bff"} />)}</Pie><Tooltip contentStyle={{ borderRadius: 16, border: "none" }} /></PieChart></ResponsiveContainer></div><div className="grid gap-2">{areaData.map((item: any) => <div className="flex items-center justify-between text-xs font-bold" key={item.label}><span className="flex items-center gap-2 text-[#526064]"><i className="h-2.5 w-2.5 rounded-full" style={{ background: AREA_META[item.label as keyof typeof AREA_META]?.color }} />{item.label}</span><span>{item.value}</span></div>)}</div></ChartCard><ChartCard title="Situación educativa" subtitle={hasSafeDemographicSample ? "Contexto de quienes participaron" : "Se muestra desde 5 participaciones"}><SimpleBars data={educationData} colors={["#406bff", "#10a979", "#f3a737", "#c55337"]} /></ChartCard><ChartCard title="Localidad" subtitle={hasSafeDemographicSample ? "Origen informado" : "Se muestra desde 5 participaciones"}><SimpleBars data={localityData} colors={["#1976b7", "#75cff7", "#10a979", "#f3a737"]} /></ChartCard><ChartCard title="Por sexo y edad" subtitle={hasSafeDemographicSample ? "Participación registrada" : "Se muestra desde 5 participaciones"}><SimpleBars data={[...sexData, ...ageData]} colors={chartColors} /></ChartCard></div></div>}
      <TopThreeRankingChart data={visibleTopThreeRanking} total={analyticsView?.total ?? 0} />
    </>}
  </section>;
}

function Kpi({ label, value, icon, tone, small = false }: { label: string; value: string | number; icon: React.ReactNode; tone: "coral" | "blue" | "green"; small?: boolean }) { const color = tone === "coral" ? "bg-[#dff3ff] text-[#1976b7]" : tone === "blue" ? "bg-[#e7ecff] text-[#406bff]" : "bg-[#dff7ef] text-[#08714d]"; return <div className="rounded-[1.65rem] border border-white bg-white p-5 shadow-sm"><div className={`mb-6 grid h-10 w-10 place-items-center rounded-xl ${color}`}>{icon}</div><p className="text-sm font-bold text-[#637073]">{label}</p><p className={`mt-1 font-display font-black tracking-[-0.04em] text-[#172124] ${small ? "text-xl leading-tight" : "text-3xl"}`}>{value}</p></div>; }
function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) { return <div className={`rounded-[1.65rem] border border-white bg-white p-5 shadow-sm ${className}`}><h2 className="font-display text-xl font-extrabold">{title}</h2><p className="mb-4 mt-1 text-sm text-[#748083]">{subtitle}</p>{children}</div>; }
function SimpleBars({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) { if (!data.length) return <div className="flex min-h-20 items-center gap-3 rounded-xl bg-[#f5fbff] px-3 text-sm leading-relaxed text-[#526064]"><ShieldCheck className="shrink-0 text-[#1976b7]" size={18} />Para cuidar la privacidad, este detalle se habilita cuando participen al menos 5 personas.</div>; const max = Math.max(...data.map((item) => item.value), 1); return <div className="space-y-4 pt-2">{data.map((item, index) => <div key={item.label}><div className="mb-1.5 flex justify-between text-sm font-bold"><span className="text-[#526064]">{item.label}</span><span>{item.value}</span></div><div className="h-2.5 rounded-full bg-[#ebeeeb]"><div className="h-full rounded-full" style={{ background: colors[index % colors.length], width: `${(item.value / max) * 100}%` }} /></div></div>)}</div>; }
function TopThreeRankingChart({ data, total }: { data: { program: string; area: string; short: string; count: number; first: number; second: number; third: number }[]; total: number }) {
  if (!total) return null;
  return <section className="mt-5"><ChartCard title="Presencia en las 3 afinidades principales" subtitle="Cada barra reúne las veces que una tecnicatura apareció como 1.ª, 2.ª o 3.ª opción. Son datos agregados, sin identificar participantes."><div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-[#526064]"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#102d54]" />1.ª afinidad</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#1976b7]" />2.ª afinidad</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#75cff7]" />3.ª afinidad</span></div><div className="h-[650px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 4, right: 20, top: 10, bottom: 0 }}><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="short" width={132} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#526064" }} /><Tooltip cursor={{ fill: "#f7f4ee" }} contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 28px rgba(23,33,36,.14)" }} /><Bar dataKey="first" name="1.ª afinidad" stackId="top-three" fill="#102d54" /><Bar dataKey="second" name="2.ª afinidad" stackId="top-three" fill="#1976b7" /><Bar dataKey="third" name="3.ª afinidad" stackId="top-three" fill="#75cff7" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div></ChartCard></section>;
}
function DashboardSkeleton() { return <div className="grid gap-5"><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div className="h-44 animate-pulse rounded-[1.65rem] bg-white" key={item} />)}</div><div className="h-80 animate-pulse rounded-[1.65rem] bg-white" /></div>; }
function InstitutionalFooter() { return <footer className="institutional-footer relative overflow-hidden border-t border-[#bfe8ff] bg-[#102d54] px-4 py-8 text-center text-white"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#155f98] via-[#75cff7] to-[#155f98]" /><div className="relative mx-auto flex max-w-3xl flex-col items-center gap-3"><img src="/logo-ies11-jujuy.jpg" alt="IES N.° 11 Jujuy" className="h-12 w-12 rounded-full border-2 border-[#75cff7] object-cover" /><p className="max-w-[22rem] font-display text-sm font-extrabold leading-snug tracking-tight sm:max-w-3xl sm:text-base">Hecho y desarrollado por alumnos de la carrera de Ciencias de Datos e Inteligencia Artificial del IES N.°&nbsp;11.</p><p className="text-sm font-semibold text-[#bfe8ff]">{HISTORICAL_ARCHIVE.enabled ? "Expo Educativa 2026 · Jujuy" : "San Salvador de Jujuy"}</p></div></footer>; }
