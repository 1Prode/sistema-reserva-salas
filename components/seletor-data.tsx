"use client";

import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale";
import "@daypicker/react/style.css";

type SeletorDataProps = {
    value: string;
    onChange: (value: string) => void;
    min: string;
    max: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
};

function converterYyyyMmDdParaDate(valor: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);

    if (!match) {
        return null;
    }

    const [, anoStr, mesStr, diaStr] = match;
    const ano = Number(anoStr);
    const mes = Number(mesStr);
    const dia = Number(diaStr);

    const data = new Date(ano, mes - 1, dia, 12, 0, 0);

    const valida =
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia;

    return valida ? data : null;
}

function converterDateParaYyyyMmDd(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function converterYyyyMmDdParaExibicao(valor: string): string {
    const data = converterYyyyMmDdParaDate(valor);

    if (!data) {
        return "";
    }

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

function converterExibicaoParaYyyyMmDd(valor: string): string | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);

    if (!match) {
        return null;
    }

    const [, diaStr, mesStr, anoStr] = match;
    const dia = Number(diaStr);
    const mes = Number(mesStr);
    const ano = Number(anoStr);

    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
        return null;
    }

    const data = new Date(ano, mes - 1, dia, 12, 0, 0);

    const valida =
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia;

    return valida ? `${anoStr}-${mesStr}-${diaStr}` : null;
}

function aplicarMascara(valorDigitado: string): string {
    const numeros = valorDigitado.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
        return numeros;
    }

    if (numeros.length <= 4) {
        return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

function ehFimDeSemana(data: Date): boolean {
    const diaDaSemana = data.getDay();

    return diaDaSemana === 0 || diaDaSemana === 6;
}

export function SeletorData({
    value,
    onChange,
    min,
    max,
    required,
    disabled,
    id,
}: SeletorDataProps) {
    const [texto, setTexto] = useState(() =>
        converterYyyyMmDdParaExibicao(value)
    );
    const [erro, setErro] = useState("");
    const [aberto, setAberto] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTexto(converterYyyyMmDdParaExibicao(value));
    }, [value]);

    useEffect(() => {
        if (!aberto) {
            return;
        }

        function aoClicarFora(evento: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(evento.target as Node)
            ) {
                setAberto(false);
            }
        }

        function aoPressionarTecla(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                setAberto(false);
            }
        }

        document.addEventListener("mousedown", aoClicarFora);
        document.addEventListener("keydown", aoPressionarTecla);

        return () => {
            document.removeEventListener("mousedown", aoClicarFora);
            document.removeEventListener("keydown", aoPressionarTecla);
        };
    }, [aberto]);

    function validarEPropagar(textoCompleto: string) {
        const valorInterno = converterExibicaoParaYyyyMmDd(textoCompleto);

        if (!valorInterno) {
            setErro("Data inválida.");
            return;
        }

        if (valorInterno < min || valorInterno > max) {
            setErro(
                `Selecione uma data entre ${converterYyyyMmDdParaExibicao(
                    min
                )} e ${converterYyyyMmDdParaExibicao(max)}.`
            );
            return;
        }

        const data = converterYyyyMmDdParaDate(valorInterno);

        if (data && ehFimDeSemana(data)) {
            setErro("Reservas não podem ser realizadas aos sábados e domingos.");
            return;
        }

        setErro("");
        onChange(valorInterno);
    }

    function aoAlterarInput(evento: ChangeEvent<HTMLInputElement>) {
        const bruto = evento.target.value;

        if (bruto === "") {
            setTexto("");
            setErro("");
            onChange("");
            return;
        }

        const mascarado = aplicarMascara(bruto);
        setTexto(mascarado);

        if (mascarado.length < 10) {
            setErro("");
            return;
        }

        validarEPropagar(mascarado);
    }

    function aoSairDoCampo(_evento: FocusEvent<HTMLInputElement>) {
        if (texto.length === 0) {
            return;
        }

        validarEPropagar(texto);
    }

    function aoSelecionarNoCalendario(dataSelecionada: Date | undefined) {
        if (!dataSelecionada) {
            return;
        }

        const valorInterno = converterDateParaYyyyMmDd(dataSelecionada);

        setTexto(converterYyyyMmDdParaExibicao(valorInterno));
        setErro("");
        onChange(valorInterno);
        setAberto(false);
    }

    const dataSelecionada = converterYyyyMmDdParaDate(value) ?? undefined;
    const dataMinima = converterYyyyMmDdParaDate(min) ?? undefined;
    const dataMaxima = converterYyyyMmDdParaDate(max) ?? undefined;

    const mesInicial = dataSelecionada ?? dataMinima ?? new Date();

    return (
        <div ref={containerRef} className="relative">
            <div className="flex gap-2">
                <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    value={texto}
                    onChange={aoAlterarInput}
                    onBlur={aoSairDoCampo}
                    required={required}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />

                <button
                    type="button"
                    onClick={() => setAberto((atual) => !atual)}
                    disabled={disabled}
                    aria-label="Abrir calendário"
                    className="flex shrink-0 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-5 w-5"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                </button>
            </div>

            {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}

            {aberto && (
                <div
                    className="absolute z-50 mt-2 rounded-lg border border-slate-300 bg-white p-2 shadow-lg"
                    style={{ "--rdp-accent-color": "#0f172a" } as CSSProperties}
                >
                    <DayPicker
                        mode="single"
                        locale={ptBR}
                        selected={dataSelecionada}
                        defaultMonth={mesInicial}
                        onSelect={aoSelecionarNoCalendario}
                        disabled={[
                            ...(dataMinima ? [{ before: dataMinima }] : []),
                            ...(dataMaxima ? [{ after: dataMaxima }] : []),
                            { dayOfWeek: [0, 6] },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}
