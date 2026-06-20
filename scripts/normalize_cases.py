import os
import json
import sys

def calculate_exact_tal(case: dict) -> int:
    # Una temperatura igual o superior a 37.5 grados invalida la aplicación de la escala de Tal
    if case.get("temperatureC", 36.5) >= 37.5:
        return -1

    score = 0
    hr = case.get("heartRate", 0)
    rr = case.get("respiratoryRate", 0)
    age = case.get("ageInMonths", 0)
    wheezing = case.get("wheezing", 0)
    retraction = case.get("retraction", 0)

    # Evaluación de Frecuencia Cardíaca
    if 120 <= hr <= 140:
        score += 1
    elif 140 < hr <= 160:
        score += 2
    elif hr > 160:
        score += 3

    # Evaluación de Frecuencia Respiratoria por subgrupos etarios
    if age < 6:
        if 40 <= rr <= 55:
            score += 1
        elif 55 < rr <= 70:
            score += 2
        elif rr > 70:
            score += 3
    else:
        if 30 <= rr <= 45:
            score += 1
        elif 45 < rr <= 60:
            score += 2
        elif rr > 60:
            score += 3

    score += wheezing + retraction
    return score

def calculate_exact_curb65(case: dict) -> int:
    score = 0
    if case.get("confusion", False):
        score += 1
    if case.get("bloodUreaNitrogen", 0) > 19:
        score += 1
    if case.get("respiratoryRate", 0) >= 30:
        score += 1
    if case.get("systolicBP", 120) < 90 or case.get("diastolicBP", 80) <= 60:
        score += 1
    if case.get("ageInMonths", 0) >= 780: # 65 años
        score += 1
    return score

def audit_and_normalize_json(filepath: str) -> bool:
    print(f"Iniciando inspección de consistencia: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            case_data = json.load(f)
            
        modified = False
        
        # Auditoría del módulo pediátrico (Lactantes con sospecha de SBO)
        if case_data.get("ageInMonths", 0) < 24 and case_data.get("hasSBO", False):
            computed_tal = calculate_exact_tal(case_data)
            declared_tal = case_data.get("talScore", -1)
            
            if computed_tal != -1 and computed_tal != declared_tal:
                print(f"Tal declarado ({declared_tal}) difiere del Tal calculado ({computed_tal}). Corrigiendo...")
                case_data["talScore"] = computed_tal
                modified = True
                
            # Forzar derivación absoluta automática ante factores de riesgo absoluto
            has_absolute_risk = (
                case_data.get("ageInMonths", 0) < 1 or
                case_data.get("hasChronicLungDisease", False) or
                case_data.get("hasCardiacDisease", False) or
                case_data.get("hasHistoryOfApnea", False) or
                case_data.get("hasSevereMalnutrition", False)
            )
            if has_absolute_risk and not case_data.get("requiresAbsoluteReferral", False):
                print("Paciente con factores de riesgo absoluto sin bandera de derivación. Activando...")
                case_data["requiresAbsoluteReferral"] = True
                modified = True

        # Auditoría del módulo de adultos (NAC)
        if case_data.get("ageInMonths", 0) >= 216 and case_data.get("hasPneumonia", False): # Adultos > 18 años
            computed_curb = calculate_exact_curb65(case_data)
            declared_curb = case_data.get("curb65Score", -1)
            
            if computed_curb != declared_curb:
                print(f"CURB-65 declarado ({declared_curb}) difiere del calculado ({computed_curb}). Corrigiendo...")
                case_data["curb65Score"] = computed_curb
                modified = True

        # Re-escribir el archivo JSON si se aplicaron normalizaciones clínicas automáticas
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(case_data, f, indent=4, ensure_ascii=False)
            print(f"Archivo {filepath} normalizado correctamente y alineado con guías clínicas.")
        else:
            print(f"Archivo {filepath} verificado. 100% consistente con las reglas clínicas.")
            
        return True
    except Exception as e:
        print(f"Error de procesamiento en archivo {filepath}: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    target_dir = "./cases/"
    if not os.path.exists(target_dir):
        print(f"El directorio de casos clínicos '{target_dir}' no existe.")
        sys.exit(1)
        
    for filename in os.listdir(target_dir):
        if filename.endswith(".json"):
            audit_and_normalize_json(os.path.join(target_dir, filename))
