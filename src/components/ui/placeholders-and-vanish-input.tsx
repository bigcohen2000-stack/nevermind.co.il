"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mic, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type Ref,
} from "react";

import { cn } from "@/lib/utils";

type PixelParticle = {
  x: number;
  y: number;
  r: number;
  color: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export type PlaceholdersAndVanishInputProps = {
  placeholders: string[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  value?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Called when voice recognition fills the field. */
  onVoiceResult?: (transcript: string) => void;
  /** Clears the field in one click (shown when value is not empty). */
  onClear?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  id?: string;
  className?: string;
  dir?: "rtl" | "ltr";
  lang?: string;
  autoComplete?: string;
  spellCheck?: boolean;
  "aria-autocomplete"?: "list" | "none" | "inline" | "both";
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-activedescendant"?: string;
  "aria-label"?: string;
};

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/**
 * Aceternity PlaceholdersAndVanishInput — NeverMind adapted:
 * black/white, RTL, controlled value, a11y, reduced-motion, voice slot.
 */
export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  value: valueProp,
  onKeyDown: onKeyDownProp,
  onFocus,
  onBlur,
  onVoiceResult,
  onClear,
  inputRef: inputRefProp,
  id,
  className,
  dir = "rtl",
  lang = "he",
  autoComplete = "off",
  spellCheck = false,
  "aria-autocomplete": ariaAutocomplete,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  "aria-activedescendant": ariaActiveDescendant,
  "aria-label": ariaLabel,
}: PlaceholdersAndVanishInputProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [internalValue, setInternalValue] = useState(valueProp ?? "");
  const [animating, setAnimating] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const isControlled = valueProp !== undefined;
  const value = isControlled ? (valueProp ?? "") : internalValue;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<PixelParticle[]>([]);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputElRef.current = node;
      assignRef(inputRefProp, node);
    },
    [inputRefProp],
  );

  useEffect(() => {
    const w = window as SpeechWindow;
    const frame = window.requestAnimationFrame(() => {
      setVoiceSupported(
        Boolean(w.SpeechRecognition || w.webkitSpeechRecognition),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reducedMotion || placeholders.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    startAnimation();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (document.visibilityState === "visible") {
        startAnimation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reducedMotion, startAnimation]);

  const draw = useCallback(() => {
    const input = inputElRef.current;
    const canvas = canvasRef.current;
    if (!input || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);

    const computedStyles = getComputedStyle(input);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = dir === "rtl" ? "right" : "left";
    ctx.direction = dir;
    const textX = dir === "rtl" ? 800 - 32 : 16;
    ctx.fillText(value, textX, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: { x: number; y: number; color: number[] }[] = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [dir, value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr: PixelParticle[] = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          if (!isControlled) setInternalValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const vanishAndSubmit = () => {
    if (reducedMotion) {
      setAnimating(false);
      return;
    }
    setAnimating(true);
    draw();
    const current = inputElRef.current?.value || "";
    if (current) {
      const maxX = newDataRef.current.reduce(
        (prev, particle) => (particle.x > prev ? particle.x : prev),
        0,
      );
      animate(maxX);
    } else {
      setAnimating(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (animating) return;
    if (!isControlled) setInternalValue(e.target.value);
    onChange(e);
  };

  const handleClear = () => {
    if (animating) return;
    if (onClear) {
      onClear();
      inputElRef.current?.focus();
      return;
    }
    if (!isControlled) setInternalValue("");
    onChange({
      target: { value: "" },
      currentTarget: { value: "" },
    } as ChangeEvent<HTMLInputElement>);
    inputElRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDownProp?.(e);
  };

  const showClear = Boolean(value) && !animating;
  const endActions = 1 + (voiceSupported ? 1 : 0) + (showClear ? 1 : 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (animating) return;
    vanishAndSubmit();
    onSubmit(e);
  };

  const startVoice = () => {
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const recognition = new Ctor();
    recognition.lang = "he-IL";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (transcript) onVoiceResult?.(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const isRtl = dir === "rtl";
  const placeholderIndex = reducedMotion ? 0 : currentPlaceholder;
  const placeholderText = placeholders[placeholderIndex] ?? placeholders[0] ?? "";

  return (
    <form
      dir={dir}
      role="search"
      className={cn(
        "relative mx-auto h-14 w-full max-w-2xl overflow-hidden rounded-full border border-white/30 bg-black transition",
        "focus-within:ring-2 focus-within:ring-action focus-within:ring-offset-2 focus-within:ring-offset-black",
        className,
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "pointer-events-none absolute top-[20%] origin-top-right scale-50 pr-20 text-base filter",
          isRtl ? "end-2 sm:end-8" : "start-2 sm:start-8 origin-top-left",
          !animating || reducedMotion ? "opacity-0" : "opacity-100",
        )}
        ref={canvasRef}
        aria-hidden="true"
      />

      <input
        id={id}
        ref={setInputRef}
        type="text"
        role="combobox"
        dir={dir}
        lang={lang}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={spellCheck}
        enterKeyHint="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel}
        aria-autocomplete={ariaAutocomplete}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded ?? false}
        aria-haspopup="listbox"
        aria-activedescendant={ariaActiveDescendant}
        className={cn(
          "relative z-50 h-full w-full rounded-full border-none bg-transparent text-sm text-white outline-none sm:text-base",
          endActions >= 3
            ? "ps-5 pe-32 sm:ps-6"
            : endActions === 2
              ? "ps-5 pe-24 sm:ps-6"
              : "ps-5 pe-14 sm:ps-6",
          "text-end",
          (value || animating) && "caret-white",
          animating && !reducedMotion && "text-transparent",
        )}
      />

      <div
        className={cn(
          "absolute top-1/2 z-50 flex -translate-y-1/2 items-center gap-1",
          "end-2",
        )}
      >
        {showClear ? (
          <button
            type="button"
            aria-label="ניקוי חיפוש"
            title="ניקוי"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition",
              "bg-transparent text-white/70 hover:bg-white/10 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
            )}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}

        {voiceSupported ? (
          <button
            type="button"
            aria-label="חיפוש קולי"
            title="חיפוש קולי"
            onClick={startVoice}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition",
              listening
                ? "bg-action text-white"
                : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
            )}
          >
            <Mic className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}

        <button
          disabled={!value || animating}
          type="submit"
          aria-label="חיפוש"
          className={cn(
            "flex size-9 items-center justify-center rounded-full transition",
            "bg-white text-black disabled:bg-white/15 disabled:text-white/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
          )}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            style={isRtl ? { transform: "scaleX(-1)" } : undefined}
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <motion.path
              d="M5 12l14 0"
              initial={false}
              animate={{
                strokeDasharray: "50%",
                strokeDashoffset: value ? 0 : "50%",
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: "linear" }
              }
            />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
          </motion.svg>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        {!value ? (
          reducedMotion ? (
            <p className="w-[calc(100%-5rem)] truncate ps-5 text-end text-sm font-normal text-white/70 sm:ps-6 sm:text-base">
              {placeholderText}
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                initial={{ y: 5, opacity: 0 }}
                key={`current-placeholder-${currentPlaceholder}`}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear" }}
                className="w-[calc(100%-5rem)] truncate ps-5 text-end text-sm font-normal text-white/70 sm:ps-6 sm:text-base"
              >
                {placeholderText}
              </motion.p>
            </AnimatePresence>
          )
        ) : null}
      </div>
    </form>
  );
}
