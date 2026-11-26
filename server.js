import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL = process.env.GOOGLE_MODEL || "gemini-2.5-flash-lite";

app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/analyze", async (req, res) => {
  try {
    if (!API_KEY) return res.status(503).json({ error: "O servidor ainda não tem GOOGLE_API_KEY configurada." });
    const image = req.body?.image;
    const match = typeof image === "string" && image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) return res.status(400).json({ error: "Imagem inválida. Usa JPG, PNG ou WEBP." });
    if (image.length > 10_000_000) return res.status(413).json({ error: "A imagem é demasiado grande. Escolhe uma fotografia mais pequena." });

    const mimeType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
    const base64Data = match[2];
    const prompt = `És o assistente de identificação visual de tecidos da MIKE TECIDOS AI.
Analisa apenas o que é visualmente observável na fotografia. Identifica um tipo provável entre: algodão, poliéster, linho, malha, feltro, TNT/não tecido, polar/fleece, veludo, jersey, denim/ganga, lã, seda, viscose, misto ou incerto.
Não afirmes a composição química nem percentagens de fibras com base apenas na imagem. Diferencia observação de hipótese. Se a imagem não mostrar tecido claramente, indica tipo_provavel como "Incerto" e explica.
Responde em português de Portugal, em JSON válido, sem markdown, com as chaves:
tipo_provavel (string), alternativas (array de strings), cor (string), textura (string), padrao (string), observacoes (string), confianca (string: baixa/média/alta), aviso (string).
A confiança é sobre a identificação visual aproximada, não sobre composição.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(API_KEY)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]}],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 500 }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message || "O serviço Gemini não conseguiu processar a imagem.";
      return res.status(502).json({ error: message });
    }
    const textOutput = payload?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n") || "";
    if (!textOutput) return res.status(502).json({ error: "A IA devolveu uma resposta vazia. Tenta outra fotografia." });
    let result;
    try { result = JSON.parse(textOutput.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }
    catch { return res.status(502).json({ error: "Não foi possível interpretar a resposta da IA. Tenta novamente." }); }
    res.json(result);
  } catch (error) {
    console.error("Erro de análise:", error);
    res.status(500).json({ error: "Ocorreu um erro no servidor ao analisar a fotografia." });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`MIKE TECIDOS AI disponível na porta ${PORT}`));
