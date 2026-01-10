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
      setHydrated(true);
    }

    // Failsafe: Force hydration after 1s if event never fires (Render/Network lag)
    const failsafe = setTimeout(() => {
        if (!hydrated) {
            console.warn("[Hydration] Failsafe triggered: Forcing render.");
            setHydrated(true);
        }
    }, 1000);

    return () => {
      if (unsub) unsub();
    };
  }, [hydrated]);

  return hydrated;
};
