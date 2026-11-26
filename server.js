import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/analyze", async (req, res) => {
  try {
    if (!API_KEY) return res.status(503).json({ error: "O servidor ainda não tem uma chave de API configurada." });
    const image = req.body?.image;
    if (typeof image !== "string" || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)) {
      return res.status(400).json({ error: "Imagem inválida. Usa JPG, PNG ou WEBP." });
    }
    if (image.length > 10_000_000) return res.status(413).json({ error: "A imagem é demasiado grande. Escolhe uma fotografia mais pequena." });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        instructions: `És o assistente de identificação visual de tecidos da MIKE TECIDOS AI.
Analisa apenas o que é visualmente observável na fotografia. Identifica um tipo provável entre: algodão, poliéster, linho, malha, feltro, TNT/não tecido, polar/fleece, veludo, jersey, denim/ganga, lã, seda, viscose, misto ou incerto.
Não afirmes a composição química ou percentagens de fibras com base apenas na imagem. Diferencia observação de hipótese. Se a imagem não mostrar tecido claramente, indica tipo_provavel como "Incerto" e explica.
Responde em português de Portugal, em JSON válido, sem markdown, com as chaves:
tipo_provavel (string), alternativas (array de strings), cor (string), textura (string), padrao (string), observacoes (string), confianca (string: baixa/média/alta), aviso (string).
A confiança é sobre a identificação visual aproximada, não sobre composição.`,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Identifica visualmente este tecido para um catálogo de loja." },
            { type: "input_image", image_url: image, detail: "high" }
          ]
        }],
        max_output_tokens: 450
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message || "O serviço de IA não conseguiu processar a imagem.";
      return res.status(response.status === 401 ? 502 : 502).json({ error: message });
    }
    const textOutput = (payload.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n");
    if (!textOutput) return res.status(502).json({ error: "A IA devolveu uma resposta vazia." });

    let result;
    try {
      const cleaned = textOutput.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      result = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: "Não foi possível interpretar a resposta da IA. Tenta novamente com uma fotografia mais nítida." });
    }
    res.json(result);
  } catch (error) {
    console.error("Erro de análise:", error);
    res.status(500).json({ error: "Ocorreu um erro no servidor ao analisar a fotografia." });
  }
});

app.listen(PORT, () => console.log(`MIKE TECIDOS AI disponível em http://localhost:${PORT}`));
