import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCqZx86lalBV3WBWRo9C1efmOBp3r_s9Uk";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Tutor AI API Endpoint
app.post("/api/tutor", async (req, res) => {
  try {
    const { scenarioTitle, vitals, tutorMessage, activeAlarms, userQuestion, lastIntervention } = req.body;

    const systemPrompt = `
      Actúas como un Tutor Clínico de Inteligencia Artificial y Motor de Simulación Médica Avanzada.
      A partir de este momento, debes procesar todos los escenarios clínicos, viñetas de pacientes y emitir todas tus respuestas o pistas de andamiaje cognitivo utilizando un registro de lenguaje estrictamente académico, formal, técnico y científico.
      
      Reglas Estrictas de Comunicación y Tono:
      1. Prohibición Absoluta de Lenguaje Coloquial: Queda estrictamente prohibido el uso de expresiones informales, vulgares, jergas o modismos regionales (por ejemplo: "che", "boludo", "al toque", "mirá"). La comunicación debe emular un entorno profesional de cuidados críticos.
      2. Traducción Semiológica Formal: Cualquier viñeta o entrada que contenga lenguaje informal debe ser interpretada y traducida inmediatamente a parámetros fisiológicos y semiológicos objetivos. Por ejemplo, términos como "frío y sudoroso" deben procesarse como "signos de hipoperfusión tisular, alteración del índice pletismográfico (PI) y diaforesis".
      3. Andamiaje Pedagógico Estructurado: Las intervenciones deben ajustarse a la jerarquía de tres niveles (1: Indirecto/Observacional, 2: Semi-directo, 3: Directivo).
      4. Rigor Científico y Determinismo: Toda directiva debe mantener la objetividad de la literatura médica, operando como un motor lógico (TypeScript/XState) que se comunica sin alucinaciones ni desviaciones semánticas.

      Mantén las respuestas compactas, de un párrafo único de no más de 4-5 líneas muy bien aprovechadas para que entren en la interfaz visual del simulador. ¡Jamás rompas el personaje de Tutor Clínico y Motor de Simulación Académico!
    `;

    const userPrompt = `
      --- CONTEXTO ACTUAL DE LA SIMULACIÓN ---
      Escenario activo: ${scenarioTitle || "Simulación general"}
      Parámetros vitales: FC: ${vitals?.ecg?.hr || 120} bpm (${vitals?.ecg?.rhythm || "Sinus"}), SpO2: ${vitals?.spo2?.value || 90}%, FR: ${vitals?.resp?.rate || 20} rpm, PAS/PAD: ${vitals?.nibp?.systolic || 100}/${vitals?.nibp?.diastolic || 60} mmHg, Temp: ${vitals?.temp?.t1 || 37.0}°C.
      Alarmas activas en la pantalla: ${activeAlarms && activeAlarms.length > 0 ? activeAlarms.map((a: any) => a.message).join(", ") : "Ninguna"}.
      Último mensaje guionizado del tutor: "${tutorMessage || "Revisá al paciente"}"
      ${lastIntervention ? `Intervención recién realizada: "${lastIntervention.label}" (${lastIntervention.isCorrect ? "Correcta" : "Incorrecta según protocolo"})` : ""}
      
      ${userQuestion ? `Pregunta directa del estudiante: "${userQuestion}"` : "El estudiante te pide una recomendación u opinión del estado actual del paciente."}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      },
    });

    const reply = response.text || "Se ha detectado una falla en el canal de comunicación telemétrico. Verifique los sensores y reintente el análisis.";
    res.json({ reply });

  } catch (err: any) {
    console.error("Error in Tutor endpoint:", err);
    res.status(500).json({ error: "Falla de comunicación con el Tutor Clínico." });
  }
});

// Vite middleware or build delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK] Bedside simulation server running on http://localhost:${PORT}`);
  });
}

startServer();
