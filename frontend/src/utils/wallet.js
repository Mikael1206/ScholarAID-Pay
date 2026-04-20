import { isConnected, getPublicKey } from "@stellar/freighter-api";

export const connectWallet = async () => {
  const result = await isConnected();
  
  if (result?.isConnected) {
    try {
      const result = await getPublicKey();
      const publicKey = result?.publicKey ?? null;
      if (!publicKey) {
        console.error("No public key returned.");
        return null;
      }
      
      return publicKey;
    } catch (e) {
      console.error("User denied connection or error occurred:", e);
      return null;
    }
  } else {
    alert("Freighter not detected! Opening download page...");
    window.open("https://www.freighter.app/", "_blank");
    return null;
  }
};