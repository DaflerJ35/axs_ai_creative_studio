export function triggerAXSEnergy(power = 1) {
  window.dispatchEvent(
    new CustomEvent("axs:energy-pulse", {
      detail: { power },
    }),
  );
}
