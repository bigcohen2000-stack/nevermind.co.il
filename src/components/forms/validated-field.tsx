"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import {
  getFieldVisualStatus,
  type FieldVisualStatus,
  type ValidateResult,
} from "@/lib/forms/validators";
import { cn } from "@/lib/utils";

export type FieldTone = "light" | "dark";

type CommonProps = {
  label: string;
  /** Short always-visible explanation under the label. */
  help?: string;
  value: string;
  onChange: (value: string) => void;
  /** Return Hebrew error string, or null when OK. */
  validate: (value: string) => ValidateResult;
  /** Parent sets true after submit attempt. */
  showErrors?: boolean;
  /** Empty value is allowed (no error until user types invalid content). */
  optional?: boolean;
  tone?: FieldTone;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  /** Show live character progress toward min length. */
  minLengthHint?: number;
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function StatusPill({
  status,
  tone,
}: {
  status: FieldVisualStatus;
  tone: FieldTone;
}) {
  if (status === "idle") {
    return (
      <span
        className={cn(
          "inline-flex min-h-7 items-center gap-1 rounded-none border px-2 text-[11px] font-medium",
          tone === "dark"
            ? "border-[#FAFAF8]/15 text-[#9CA3AF]"
            : "border-[#1A1A1A]/15 text-[#9CA3AF]",
        )}
        aria-hidden
      >
        למילוי
      </span>
    );
  }

  const ok = status === "valid";
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-none border px-2 text-[11px] font-medium",
        ok
          ? tone === "dark"
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
            : "border-emerald-700/35 bg-emerald-700/5 text-emerald-800"
          : tone === "dark"
            ? "border-[#D42B2B]/70 bg-[#D42B2B]/10 text-[#FF8A8A]"
            : "border-[#D42B2B] bg-[#D42B2B]/5 text-[#D42B2B]",
      )}
      aria-hidden
    >
      {ok ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CrossIcon className="size-3.5" />
      )}
      {ok ? "מוכן" : "לתיקון"}
    </span>
  );
}

function useFieldChrome(
  value: string,
  validate: (value: string) => ValidateResult,
  showErrors: boolean,
  optional: boolean,
) {
  const [touched, setTouched] = useState(false);
  const error = validate(value);
  const status = getFieldVisualStatus(value, error, {
    touched,
    showErrors,
    optional,
  });
  const showMessage =
    status === "invalid" && Boolean(error) && (touched || showErrors);

  return {
    touched,
    error,
    status,
    showMessage,
    markTouched: () => setTouched(true),
    onValueChange: (next: string) => {
      // Live feedback after the first edit feels friendlier than waiting for blur.
      if (next.length > 0 || touched) setTouched(true);
    },
  };
}

function labelRow(
  label: string,
  optional: boolean,
  status: FieldVisualStatus,
  tone: FieldTone,
  htmlFor: string,
) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium",
          tone === "dark" ? "text-[#FAFAF8]" : "text-[#1A1A1A]",
        )}
      >
        {label}
        {optional ? (
          <span className="ms-1.5 font-normal text-[#9CA3AF]">לא חובה</span>
        ) : (
          <span
            className={cn(
              "ms-1.5 font-normal",
              tone === "dark" ? "text-[#FAFAF8]/45" : "text-[#1A1A1A]/40",
            )}
            aria-hidden
          >
            *
          </span>
        )}
      </label>
      <StatusPill status={status} tone={tone} />
    </div>
  );
}

function feedbackBlock({
  help,
  showMessage,
  error,
  status,
  tone,
  describedById,
  value,
  minLengthHint,
}: {
  help?: string;
  showMessage: boolean;
  error: ValidateResult;
  status: FieldVisualStatus;
  tone: FieldTone;
  describedById: string;
  value: string;
  minLengthHint?: number;
}) {
  const len = value.trim().length;
  const showCount =
    typeof minLengthHint === "number" &&
    minLengthHint > 0 &&
    status !== "valid";

  return (
    <div className="mt-1.5 space-y-1">
      {showMessage && error ? (
        <p
          id={describedById}
          className="text-xs leading-relaxed text-[#D42B2B]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!showMessage && status === "valid" ? (
        <p
          id={describedById}
          className={cn(
            "text-xs leading-relaxed",
            tone === "dark" ? "text-emerald-300/90" : "text-emerald-800",
          )}
        >
          מעולה. השדה מוכן.
        </p>
      ) : null}

      {!showMessage && status !== "valid" && help ? (
        <p
          id={describedById}
          className="text-xs leading-relaxed text-[#9CA3AF]"
        >
          {help}
        </p>
      ) : null}

      {showCount ? (
        <p
          className={cn(
            "text-[11px] tabular-nums",
            len >= minLengthHint!
              ? tone === "dark"
                ? "text-emerald-300/80"
                : "text-emerald-800/80"
              : "text-[#9CA3AF]",
          )}
          aria-live="polite"
        >
          {len}/{minLengthHint} תווים
        </p>
      ) : null}
    </div>
  );
}

function inputBorderClass(status: FieldVisualStatus, tone: FieldTone) {
  if (status === "invalid") {
    return "border-[#D42B2B] focus-visible:border-[#D42B2B] focus-visible:ring-[#D42B2B]";
  }
  if (status === "valid") {
    return tone === "dark"
      ? "border-emerald-500/45 focus-visible:border-emerald-400 focus-visible:ring-emerald-400"
      : "border-emerald-700/35 focus-visible:border-emerald-700 focus-visible:ring-emerald-700";
  }
  return tone === "dark"
    ? "border-[#FAFAF8]/20 focus-visible:border-action focus-visible:ring-action"
    : "border-[#1A1A1A]/20 focus-visible:border-[#D42B2B] focus-visible:ring-[#D42B2B]";
}

const baseInput =
  "mt-1.5 w-full min-h-12 rounded-none px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 disabled:opacity-60";

export function ValidatedInput({
  id: idProp,
  label,
  help,
  value,
  onChange,
  validate,
  showErrors = false,
  optional = false,
  tone = "light",
  className,
  inputClassName,
  disabled,
  type = "text",
  minLengthHint,
  ...rest
}: CommonProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "id" | "className"
  > & { id?: string }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedById = `${id}-msg`;
  const { error, status, showMessage, markTouched, onValueChange } =
    useFieldChrome(value, validate, showErrors, optional);

  return (
    <div className={className}>
      {labelRow(label, optional, status, tone, id)}
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        aria-invalid={status === "invalid"}
        aria-describedby={describedById}
        onChange={(e) => {
          onValueChange(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={markTouched}
        className={cn(
          baseInput,
          tone === "dark"
            ? "bg-black text-[#FAFAF8] placeholder:text-[#9CA3AF]"
            : "bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF]",
          inputBorderClass(status, tone),
          inputClassName,
        )}
        {...rest}
      />
      {feedbackBlock({
        help,
        showMessage,
        error,
        status,
        tone,
        describedById,
        value,
        minLengthHint,
      })}
    </div>
  );
}

export function ValidatedTextarea({
  id: idProp,
  label,
  help,
  value,
  onChange,
  validate,
  showErrors = false,
  optional = false,
  tone = "light",
  className,
  inputClassName,
  disabled,
  rows = 3,
  minLengthHint,
  ...rest
}: CommonProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "id" | "className"
  > & { id?: string }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedById = `${id}-msg`;
  const { error, status, showMessage, markTouched, onValueChange } =
    useFieldChrome(value, validate, showErrors, optional);

  return (
    <div className={className}>
      {labelRow(label, optional, status, tone, id)}
      <textarea
        id={id}
        value={value}
        rows={rows}
        disabled={disabled}
        aria-invalid={status === "invalid"}
        aria-describedby={describedById}
        onChange={(e) => {
          onValueChange(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={markTouched}
        className={cn(
          baseInput,
          "min-h-[6.5rem] resize-y",
          tone === "dark"
            ? "bg-black text-[#FAFAF8] placeholder:text-[#9CA3AF]"
            : "bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF]",
          inputBorderClass(status, tone),
          inputClassName,
        )}
        {...rest}
      />
      {feedbackBlock({
        help,
        showMessage,
        error,
        status,
        tone,
        describedById,
        value,
        minLengthHint,
      })}
    </div>
  );
}

export function ValidatedSelect({
  id: idProp,
  label,
  help,
  value,
  onChange,
  validate,
  showErrors = false,
  optional = false,
  tone = "light",
  className,
  inputClassName,
  disabled,
  children,
  ...rest
}: CommonProps &
  Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "onChange" | "id" | "className" | "children"
  > & { id?: string; children: ReactNode }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedById = `${id}-msg`;
  const { error, status, showMessage, markTouched, onValueChange } =
    useFieldChrome(value, validate, showErrors, optional);

  return (
    <div className={className}>
      {labelRow(label, optional, status, tone, id)}
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={status === "invalid"}
        aria-describedby={describedById}
        onChange={(e) => {
          onValueChange(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={markTouched}
        className={cn(
          baseInput,
          tone === "dark"
            ? "bg-black text-[#FAFAF8]"
            : "bg-white text-[#1A1A1A]",
          inputBorderClass(status, tone),
          inputClassName,
        )}
        {...rest}
      >
        {children}
      </select>
      {feedbackBlock({
        help,
        showMessage,
        error,
        status,
        tone,
        describedById,
        value,
      })}
    </div>
  );
}

/** Checkbox with friendly status when required. */
export function ValidatedCheckbox({
  id: idProp,
  label,
  help,
  checked,
  onChange,
  showErrors = false,
  required = true,
  tone = "light",
  className,
}: {
  id?: string;
  label: ReactNode;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  showErrors?: boolean;
  required?: boolean;
  tone?: FieldTone;
  className?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [touched, setTouched] = useState(false);
  const reveal = touched || showErrors;
  const invalid = required && !checked && reveal;
  const status: FieldVisualStatus = !required
    ? "idle"
    : checked
      ? "valid"
      : reveal
        ? "invalid"
        : "idle";

  return (
    <div
      className={cn(
        "border px-3 py-3",
        invalid
          ? "border-[#D42B2B]"
          : tone === "dark"
            ? "border-[#FAFAF8]/15"
            : "border-[#1A1A1A]/15",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            onChange(e.target.checked);
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          aria-invalid={invalid}
          className="mt-0.5 size-5 shrink-0 accent-[var(--action)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <label
              htmlFor={id}
              className={cn(
                "text-sm leading-relaxed",
                tone === "dark" ? "text-[#FAFAF8]" : "text-[#1A1A1A]",
              )}
            >
              {label}
            </label>
            <StatusPill status={status} tone={tone} />
          </div>
          {help && !invalid ? (
            <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{help}</p>
          ) : null}
          {invalid ? (
            <p className="mt-1 text-xs text-[#D42B2B]" role="alert">
              סמנו כאן כדי להמשיך. זה מאשר שקראתם.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type FillGuideItem = {
  id: string;
  label: string;
  ok: boolean;
  optional?: boolean;
};

/**
 * Compact checklist above submit buttons: what is still missing.
 */
export function FormFillGuide({
  items,
  tone = "light",
  className,
}: {
  items: FillGuideItem[];
  tone?: FieldTone;
  className?: string;
}) {
  const required = items.filter((i) => !i.optional);
  const done = required.filter((i) => i.ok).length;
  const total = required.length;
  const allReady = done === total && total > 0;

  return (
    <div
      className={cn(
        "border px-3 py-3",
        tone === "dark" ? "border-[#FAFAF8]/15" : "border-[#1A1A1A]/15",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-xs font-medium",
            tone === "dark" ? "text-[#FAFAF8]" : "text-[#1A1A1A]",
          )}
        >
          {allReady ? "הכול מוכן לשליחה" : "מה עוד חסר"}
        </p>
        <p className="text-[11px] tabular-nums text-[#9CA3AF]">
          {done}/{total}
        </p>
      </div>

      <div
        className={cn(
          "mt-2 h-1.5 w-full overflow-hidden",
          tone === "dark" ? "bg-[#FAFAF8]/10" : "bg-[#1A1A1A]/10",
        )}
        aria-hidden
      >
        <div
          className={cn(
            "h-full transition-[width] duration-300",
            allReady ? "bg-emerald-600" : "bg-[#D42B2B]",
          )}
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>

      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span
              className={cn(
                item.ok
                  ? tone === "dark"
                    ? "text-emerald-300"
                    : "text-emerald-800"
                  : "text-[#9CA3AF]",
              )}
            >
              {item.label}
              {item.optional ? " (לא חובה)" : ""}
            </span>
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center border",
                item.ok
                  ? tone === "dark"
                    ? "border-emerald-500/50 text-emerald-300"
                    : "border-emerald-700/40 text-emerald-800"
                  : tone === "dark"
                    ? "border-[#FAFAF8]/20 text-[#9CA3AF]"
                    : "border-[#1A1A1A]/20 text-[#9CA3AF]",
              )}
              aria-hidden
            >
              {item.ok ? <CheckIcon className="size-3" /> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Run validators; return first error or null. Also useful to gate submit. */
export function firstError(
  checks: Array<() => ValidateResult>,
): ValidateResult {
  for (const check of checks) {
    const err = check();
    if (err) return err;
  }
  return null;
}
