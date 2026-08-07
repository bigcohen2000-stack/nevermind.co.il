"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type WhatsAppTopicContextValue = {
  topic: string | null;
  setTopic: (topic: string | null) => void;
};

const WhatsAppTopicContext = createContext<WhatsAppTopicContextValue | null>(
  null,
);

/**
 * Lets watch/article pages publish a topic for the floating WhatsApp CTA.
 */
export function WhatsAppTopicProvider({ children }: { children: ReactNode }) {
  const [topic, setTopic] = useState<string | null>(null);
  const value = useMemo(() => ({ topic, setTopic }), [topic]);
  return (
    <WhatsAppTopicContext.Provider value={value}>
      {children}
    </WhatsAppTopicContext.Provider>
  );
}

export function useWhatsAppTopic(): WhatsAppTopicContextValue {
  const ctx = useContext(WhatsAppTopicContext);
  if (!ctx) {
    return {
      topic: null,
      setTopic: () => undefined,
    };
  }
  return ctx;
}

/**
 * Sets the WhatsApp float topic while mounted. Clears on unmount.
 */
export function WhatsAppTopicSetter({ topic }: { topic: string }) {
  const { setTopic } = useWhatsAppTopic();
  useEffect(() => {
    const trimmed = topic.trim();
    setTopic(trimmed || null);
    return () => setTopic(null);
  }, [topic, setTopic]);
  return null;
}
