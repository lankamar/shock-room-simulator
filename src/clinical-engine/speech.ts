export class SpeechHintSystem {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  public cancel(): void {
    this.synth.cancel();
  }

  public triggerVoiceHint(hintText: string, level: 1 | 2 | 3): void {
    // Cancelar cualquier mensaje previo en curso para evitar retrasos acústicos
    this.synth.cancel();

    const activeUtterance = new SpeechSynthesisUtterance(hintText);
    activeUtterance.lang = 'es-AR'; // Español rioplatense (o es-ES según navegador)

    // Ajuste paramétrico de la voz según el nivel de urgencia pedagógica
    switch (level) {
      case 1:
        activeUtterance.rate = 1.0; // Velocidad de habla normal
        activeUtterance.pitch = 1.0; // Tono base estándar
        break;
      case 2:
        activeUtterance.rate = 1.15; // Habla ligeramente más rápida
        activeUtterance.pitch = 1.05;
        break;
      case 3:
        activeUtterance.rate = 1.3; // Velocidad acelerada, denota emergencia clínica
        activeUtterance.pitch = 1.15; // Tono más agudo para captar atención inmediata
        break;
    }
    
    this.synth.speak(activeUtterance);
  }
}
