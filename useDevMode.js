export function useDevMode() {
  const prefersDevMode = usePrefersDevMode();
  const [isEnabled, setIsEnabled] = useSafeLocalStorage("dev-mode", undefined);

  const enabled = isEnabled === undefined ? prefersDevMode : isEnabled;

  useEffect(() => {
    if (window === undefined) return;
    const root = window.document.documentElement;
    root.classList.remove(enabled ? "main" : "dev");
    root.classList.add(enabled ? "dev" : "main");
  }, [enabled]);

  return [enabled, setIsEnabled];
}
