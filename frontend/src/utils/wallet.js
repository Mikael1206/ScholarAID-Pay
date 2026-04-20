import {
  isConnected,
  isAllowed,
  setAllowed,
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

    // Step 2 — check if this site is already allowed
    const allowedResult = await isAllowed();
    const alreadyAllowed = allowedResult?.isAllowed ?? false;

    // Step 3 — if not allowed yet, call setAllowed() — this triggers the popup
    if (!alreadyAllowed) {
      const setResult = await setAllowed();
      const nowAllowed = setResult?.isAllowed ?? false;

      if (!nowAllowed) {
        console.error("User denied access in Freighter.");
        return null;
      }
    }

    // Step 4 — get the public key (user is now authorized)
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