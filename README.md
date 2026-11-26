# MIKE TECIDOS AI — versão web básica com análise visual por IA

## O que inclui
- Interface adaptada a telemóvel e computador.
- Carregamento de fotografia.
- Análise visual por IA através da OpenAI Responses API.
- Sugestão de tipo provável, alternativas, cor, textura, padrão e confiança visual.
- Preenchimento do formulário com o resultado e catálogo local com exportação CSV.

## Requisitos
- Node.js 18 ou superior.
- Uma chave da API OpenAI com acesso e faturação configurados.
- A chave fica no servidor, nunca no HTML/browser.

## Executar localmente
1. Descompacta o ZIP.
2. Abre um terminal dentro da pasta.
3. Executa `npm install`.
4. Copia `.env.example` para `.env`.
5. Coloca a tua chave em `OPENAI_API_KEY` no ficheiro `.env`.
6. Executa `npm start`.
7. Abre `http://localhost:3000`.

## Publicar
Publica esta pasta num alojamento que suporte Node.js (por exemplo, Render, Railway ou outro alojamento Node).
Define as variáveis de ambiente `OPENAI_API_KEY` e, opcionalmente, `OPENAI_MODEL` no painel seguro do alojamento.
O comando de arranque é `npm start`.

## Privacidade e limites
- A fotografia é enviada ao servidor e depois à API para análise.
- O servidor não guarda as fotografias nem as análises no disco.
- Os registos do catálogo ficam no armazenamento local do navegador e não sincronizam entre dispositivos.
- O modelo pode errar. A fotografia não permite confirmar percentagens de fibras ou composição química. Valida com etiqueta, ficha técnica ou testes.
- Protege a chave da API; nunca a publiques nem a coloques no frontend.
