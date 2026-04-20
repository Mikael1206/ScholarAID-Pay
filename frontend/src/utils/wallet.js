import {
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";

export const connectWallet = async () => {
  try {
    // Step 1 — check if Freighter extension is installed
    const connectionResult = await isConnected();
    const freighterInstalled = connectionResult?.isConnected ?? false;

    if (!freighterInstalled) {
      alert("Freighter wallet not detected! Opening download page...");
      window.open("https://www.freighter.app/", "_blank");
      return null;
    }

    // Step 2 — requestAccess triggers the Freighter popup AND returns the address
    // Correct Freighter v6 API — handles allow-listing + key retrieval in one call
    const accessObj = await requestAccess();

    if (accessObj.error) {
      console.error("Freighter access denied:", accessObj.error);
      return null;
    }

    const address = accessObj.address ?? null;

    if (!address) {
      console.error("No address returned from Freighter.");
      return null;
    }

    return address;

  } catch (e) {
    console.error("Wallet connection error:", e);
    return null;
  }
};

export const checkFreighterInstalled = async () => {
  try {
    const result = await isConnected();
    return result?.isConnected ?? false;
  } catch {
    return false;
  }
};