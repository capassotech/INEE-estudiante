import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, FileText } from "lucide-react";
import type { Examen, ExamenRealizado } from "@/services/examenService";

/**
 * Modal "Ver examen realizado":
 * - examen: viene de GET /api/examenes/formacion/:idFormacion → se usa para enunciados, opciones y respuesta.fundamentacion.
 * - examenRealizado: viene de GET exámenes-realizados/... → solo para qué opción eligió el usuario en cada pregunta (respuestaIds), nota e intento.
 * Las fundamentaciones viven en la definición del examen (formación), no en el examen realizado.
 */
interface VerExamenRealizadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursoId: string;
  examen: Examen | null;
  examenRealizado: ExamenRealizado | null;
  loading: boolean;
}

export default function VerExamenRealizadoModal({
  open,
  onOpenChange,
  cursoId,
  examen,
  examenRealizado,
  loading,
}: VerExamenRealizadoModalProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Examen realizado
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !examen || !examenRealizado ? (
          <p className="text-sm text-muted-foreground py-4">
            No se pudo cargar el examen realizado.
          </p>
        ) : (
          <div className="overflow-y-auto pr-2 space-y-4 flex-1">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>
                Nota: <strong className="text-foreground">{examenRealizado.nota.toFixed(1)}%</strong>
              </span>
              <span>Intento {examenRealizado.intento}</span>
            </div>

            {/* Recorrer preguntas del examen por formación (enunciados y opciones con fundamentacion). */}
            {examen.preguntas.map((pregunta, index) => {
              const respuestaUsuario = examenRealizado.respuestas.find(
                (r) => r.preguntaId === pregunta.id
              );
              const respuestasSeleccionadas = respuestaUsuario?.respuestaIds || [];
              const fundamentacionPregunta =
                pregunta.fundamentacion ??
                pregunta.fundamentación ??
                pregunta.fundamento ??
                respuestaUsuario?.fundamentacion ??
                "";

              const respuestasCorrectasIds = pregunta.respuestas
                .filter((r) => r.esCorrecta)
                .map((r) => r.id)
                .sort();
              const respuestasUsuarioIds = [...respuestasSeleccionadas].sort();
              const esCorrecta =
                respuestasCorrectasIds.length === respuestasUsuarioIds.length &&
                respuestasCorrectasIds.every(
                  (id, i) => id === respuestasUsuarioIds[i]
                );

              return (
                <Card key={pregunta.id} className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium">
                        Pregunta {index + 1}: {pregunta.texto}
                      </CardTitle>
                      <Badge
                        variant={esCorrecta ? "default" : "destructive"}
                        className="flex-shrink-0"
                      >
                        {esCorrecta ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Correcta
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Incorrecta
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Opciones
                      </p>
                      {/* Opciones y fundamentacion vienen del examen por formación (pregunta.respuestas[]). */}
                      {pregunta.respuestas.map((respuesta) => {
                        const seleccionada = respuestasSeleccionadas.includes(respuesta.id);
                        const fundamentacionRespuesta =
                          respuesta.fundamentacion ??
                          respuesta.fundamentación ??
                          respuesta.justificacion ??
                          respuesta.fundamento ??
                          "";
                        return (
                          <div
                            key={respuesta.id}
                            className={`p-3 rounded-lg border text-sm ${
                              respuesta.esCorrecta
                                ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20"
                                : seleccionada
                                ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20"
                                : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">
                                {respuesta.esCorrecta ? (
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : seleccionada ? (
                                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                                ) : (
                                  <span className="w-4 h-4 block" />
                                )}
                              </span>
                              <div className="flex-1 min-w-0 space-y-2">
                                <div>
                                  <span
                                    className={
                                      respuesta.esCorrecta
                                        ? "font-medium text-green-800 dark:text-green-200"
                                        : seleccionada
                                        ? "font-medium text-red-800 dark:text-red-200"
                                        : "text-gray-700 dark:text-gray-300"
                                    }
                                  >
                                    {respuesta.texto}
                                  </span>
                                  {respuesta.esCorrecta && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                      (Respuesta correcta)
                                    </span>
                                  )}
                                  {seleccionada && !respuesta.esCorrecta && (
                                    <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                      (Tu elección)
                                    </span>
                                  )}
                                  {seleccionada && respuesta.esCorrecta && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                      (Tu elección)
                                    </span>
                                  )}
                                </div>
                                {(fundamentacionRespuesta && fundamentacionRespuesta.trim() !== "") && (
                                  <div className="mt-2 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide mb-1">
                                      Fundamentación
                                    </p>
                                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                                      {fundamentacionRespuesta.trim()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(fundamentacionPregunta && fundamentacionPregunta.trim() !== "") && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wide mb-1">
                          Fundamentación
                        </p>
                        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                          {fundamentacionPregunta}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
