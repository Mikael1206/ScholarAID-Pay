import { isConnected, getPublicKey } from "@stellar/freighter-api";

export const connectWallet = async () => {
  const freighterCheck = await isConnected();
  
  if (freighterCheck) {
    try {
      const publicKey = await getPublicKey();
      return publicKey;
    } catch (e) {
      console.error("User denied connection", e);
      return null;
    }
  } else {
    alert("Freighter not detected! Opening download page...");
    window.open("https://www.freighter.app/", "_blank");
    return null;
  }
};