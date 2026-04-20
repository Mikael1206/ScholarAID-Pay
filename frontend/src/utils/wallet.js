import {
  isConnected,
  requestAccess,
  getPublicKey,
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

    // Step 2 — request user permission (this triggers the Freighter popup)
    const accessResult = await requestAccess();

    // requestAccess returns either an error string or the public key directly
    if (accessResult?.error) {
      console.error("Access denied:", accessResult.error);
      return null;
    }

    // Step 3 — get the public key
    const keyResult = await getPublicKey();
    const publicKey = keyResult?.publicKey ?? null;

    if (!publicKey) {
      console.error("No public key returned from Freighter.");
      return null;
    }

    return publicKey;
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