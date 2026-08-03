"use client";

import { useEffect, useState } from "react";

import { buildTimeGreeting } from "@/lib/greeting/time-greeting";

type TimeOfDayGreetingProps = {
  name?: string | null;
  className?: string;
};

/**
 * Client greeting for Israel day-part + optional short name.
 */
export function TimeOfDayGreeting({
  name,
  className,
}: TimeOfDayGreetingProps) {
  const [text, setText] = useState(() => buildTimeGreeting({ name }));

  useEffect(() => {
    setText(buildTimeGreeting({ name }));
  }, [name]);

  return <span className={className}>{text}</span>;
}
