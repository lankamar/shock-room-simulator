# 🏥 Shock Room Simulator

**Simulador de Monitor de Paciente para Enseñanza de Enfermería en Terapia Intensiva**

---

## 🔗 LIVE DEMO

👉 **[Abrir Shock Room Simulator](https://lankamar.github.io/shock-room-simulator/)** 👈

---

## 🎯 Acerca de

Simulador de alta fidelidad de un monitor multiparamétrico de UTI/Shock Room.
Desarrollado para la enseñanza de enfermería en el marco del curso **VibeCoding en la Enseñanza** de **CITEP-UBA**.

**Características:**
- Monitor con 2 derivaciones ECG (DII y V1), SpO2, RESP, EtCO2
- Curvas suaves con morfología realista (Gaussianas)
- 5 escenarios clínicos basados en patologías reales
- Selector de casos clínicos
- Tutor Clínico IA (con Gemini API o modo offline)
- Sistema de alarmas IEC 60601-1-8

---

## ⚡ Desarrollo Local

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## 🧠 Tutor IA

Para activar el Tutor Clínico con Gemini, crear `.env.local`:

```bash
VITE_GEMINI_API_KEY=tu-api-key-de-gemini
```

Sin API key funciona en modo offline con respuestas basadas en reglas clínicas.

---

## 🚀 Deploy en Hostinger (Node.js)

```bash
npm run build
npm start
```

El servidor Express sirve los archivos en `dist/` y escucha en el puerto configurado (`PORT`).

---

## 📚 Escenarios Clínicos

| Escenario | Patología | Basado en |
|-----------|-----------|-----------|
| Shock Hipovolémico | Hemorragia + taquicardia | ATLS 10th Ed |
| Intoxicación por CO | El gran simulador | Manual Clínico CO |
| Bronquiolitis Grave | Lactante con TAL 10/12 | Emergencias Respiratorias Pediátricas |
| Shock Distributivo | Mastocitosis/Anafilaxia | Monitorización Multimodal |
| Neumonía con Derrame | NAC + derrame pleural | Emergencias Respiratorias Pediátricas |

---

Desarrollado por **Lic. Marcelo Omar Lancry Kamycki** (@lankamar)
CITEP-UBA | VibeCoding 1°C 2026
