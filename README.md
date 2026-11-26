# MIKE TECIDOS AI — Gemini API (camada gratuita)

## Inclui
- Interface web responsiva para iPhone e computador.
- Upload/fotografia de tecidos.
- Análise visual com Gemini API, com modelo configurável.
- Sugestões de tipo provável, cor, textura, padrão e confiança.
- Catálogo local e exportação CSV.

## Configurar API gratuita
1. Cria uma chave em https://aistudio.google.com/api-keys.
2. No Render, abre o serviço > Environment.
3. Adiciona `GOOGLE_API_KEY` com a chave criada.
4. Adiciona `GOOGLE_MODEL` com `gemini-2.5-flash-lite`.
5. Faz Save Changes / redeploy.

A API Gemini tem camada gratuita para modelos selecionados, com limites de utilização. Consulta os limites e preços atuais antes de publicar para utilização intensiva: https://ai.google.dev/gemini-api/docs/pricing

## Publicar no Render
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: vazio, se `package.json` estiver na raiz do repositório.

## Segurança e privacidade
- Nunca coloques a chave API no HTML, no GitHub ou no browser.
- Guarda-a apenas nas Environment Variables do Render.
- No plano gratuito, os dados enviados podem ser usados pela Google para melhorar os produtos, conforme os termos aplicáveis.
- O serviço não guarda imagens no disco; o catálogo é guardado localmente no browser.
- A IA apenas sugere uma identificação visual. Não consegue confirmar percentagens de fibras ou composição química por fotografia.
