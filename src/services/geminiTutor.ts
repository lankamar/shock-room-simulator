let genai: any = null;

async function getGenAI() {
  if (!genai) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (apiKey) {
        genai = new GoogleGenAI({ apiKey });
      }
    } catch {
      genai = null;
    }
  }
  return genai;
}

const SYSTEM_PROMPT = `Eres un tutor clínico experto en medicina de emergencias y terapia intensiva. 
Tu rol es guiar al estudiante mediante el método socrático: haz preguntas, no des respuestas directas.
Contexto actual del simulador:
- Es un Shock Room / UTI
- El estudiante está evaluando un paciente crítico
- Debes analizar los signos vitales y dar retroalimentación educativa

Reglas:
1. Responde en español, máximo 3 oraciones
2. Si el estudiante está en lo correcto, refuérzalo y sugiere el siguiente paso
3. Si está equivocado, explica por qué sin ser condescendiente
4. Usa terminología médica precisa pero explicando conceptos
5. NO des la respuesta directa - guía al razonamiento
6. Si te preguntan por un fármaco, explica mecanismo de acción, dosis y efectos adversos`;

export interface TutorContext {
  rhythm: string;
  hr: number;
  spo2: number;
  nibp: string;
  resp: number;
  temp: number;
  scenarioTitle: string;
  lastIntervention?: string;
  tutorMessage?: string;
  chatHistory?: { role: 'student' | 'tutor'; text: string }[];
}

export async function getTutorResponse(userMessage: string, context: TutorContext): Promise<string> {
  try {
    const client = await getGenAI();
    if (!client) {
      return fallbackResponse(userMessage, context);
    }

    const vitalsStr = `Signos vitales actuales:
- Ritmo: ${context.rhythm} | FC: ${context.hr} bpm
- SpO2: ${context.spo2}% | PI: monitoreado
- NIBP: ${context.nibp} mmHg
- FR: ${context.resp} rpm
- Temp: ${context.temp}°C
- Escenario: ${context.scenarioTitle}
- Última intervención: ${context.lastIntervention || 'ninguna'}
- Último mensaje del tutor: ${context.tutorMessage || 'ninguno'}`;

    const history = (context.chatHistory || []).slice(-6).map(m =>
      `${m.role === 'student' ? 'Estudiante' : 'Tutor'}: ${m.text}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\n${vitalsStr}\n\nHistorial:\n${history}\n\nEstudiante: ${userMessage}\nTutor:`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });

    return response.text || 'No pude procesar tu consulta. ¿Podés reformularla?';
  } catch (err) {
    console.error('Gemini API error:', err);
    return fallbackResponse(userMessage, context);
  }
}

function fallbackResponse(_msg: string, ctx: TutorContext): string {
  const hr = ctx.hr;
  const spo2 = ctx.spo2;

  if (hr > 120) {
    return `El paciente presenta taquicardia sinusal (${hr} bpm). ¿Qué mecanismos compensatorios creés que están actuando? ¿Cómo se relaciona con el estado de volumen del paciente?`;
  }
  if (hr < 55) {
    return `Bradicardia (${hr} bpm). ¿Evaluaste la perfusión periférica? Recordá que el PI nos da información sobre la coherencia hemodinámica.`;
  }
  if (spo2 < 90) {
    return `Hipoxemia (SpO2 ${spo2}%). ¿Cuál es el primer paso en la evaluación de la oxigenación? ¿Pensaste en la relación V/Q?`;
  }
  return `Observando los signos vitales: FC ${hr} bpm, SpO2 ${spo2}%, PA ${ctx.nibp}. ¿Qué impresión clínica te genera este paciente? ¿Cuál sería tu próxima intervención?`;
}
