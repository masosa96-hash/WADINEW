import { useContext } from "react";
import { BackendHealthContext } from "./BackendHealthContext";

export const useBackendHealth = () => {
  const context = useContext(BackendHealthContext);
  if (context === undefined) {
    throw new Error(
      "useBackendHealth must be used within a BackendHealthProvider"
    );
  }
  return context;
};
