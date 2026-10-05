// Gate de calidad React: falla si el puntaje de react-doctor baja del mínimo de la versión.
// Umbrales del spec §5.2: 60 (2.1) → 75 (2.4) → 90 (2.6+). No corre en `prepare`.
import { doctorScore } from './audit/baseline.mjs'

export const DOCTOR_MIN = 75

const score = doctorScore()
if (score < DOCTOR_MIN) {
  console.error(`[doctor] react-doctor ${score}/100 < mínimo ${DOCTOR_MIN}. Ejecuta \`npm run doctor\` para ver los hallazgos.`)
  process.exitCode = 1
} else {
  console.log(`[doctor] react-doctor ${score}/100 (mínimo ${DOCTOR_MIN}): OK`)
}
