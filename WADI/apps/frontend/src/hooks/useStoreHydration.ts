import { useEffect, useState } from "react";
import { useChatStore } from "../store/chatStore";

export const useStoreHydration = () => {
  const [hydrated, setHydrated] = useState(() => {
    return useChatStore.persist.hasHydrated();
  });

  useEffect(() => {
    const unsub = useChatStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useChatStore.persist.hasHydrated() && !hydrated) {
      setTimeout(() => setHydrated(true), 0);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [hydrated]);

  return hydrated;
};
