import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginBtn() {

  const [request, response, promptAsync] = Google.useAuthRequest({
   
    webClientId: "7772712425109-ovm01hkpelubdq1b9np4jtfe4gg87tf4.apps.googleusercontent.com",  // backend uses this
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      console.log("ID TOKEN = ", authentication.idToken);

      // send token to backend
      sendToBackend(authentication.idToken);
    }
  }, [response]);

  const sendToBackend = async (idToken) => {
    const res = await fetch("http://localhost:8084/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    });

    const data = await res.json();
    console.log("BACKEND RESPONSE = ", data);
  };

  return <Button title="Login with Google" onPress={() => promptAsync()} />;
}
