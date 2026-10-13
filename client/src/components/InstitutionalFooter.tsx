import React from "react";

export function InstitutionalFooter() {
  return (
    <footer className="institutional-footer relative mt-auto border-t border-[#bfe8ff]/60 bg-gradient-to-b from-[#0c2444] to-[#08182f] px-4 py-6 text-center text-white sm:py-7">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#4db5ed] to-transparent opacity-80" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 sm:gap-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-ies11-jujuy.jpg"
            alt="IES N.° 11 Jujuy"
            className="h-6 w-6 rounded-full border border-[#75cff7]/80 object-cover shadow-xs"
          />
          <span className="text-xs font-black tracking-wider text-[#93d8ff] uppercase">
            IES N.° 11 · Jujuy
          </span>
        </div>
        <p className="text-xs font-semibold tracking-wide text-[#dff3ff] sm:text-sm">
          Desarrollado por Alan Bustamante · TS en Ciencia de Datos e IA — IES N.° 11
        </p>
        <p className="text-[11px] font-medium text-[#7fa3c4]">
          Sistema Institucional de Orientación Vocacional para Ingresantes
        </p>
      </div>
    </footer>
  );
}

export default InstitutionalFooter;
