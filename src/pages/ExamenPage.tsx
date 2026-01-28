import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import examenService, { Examen, RespuestaUsuario } from '@/services/examenService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ExamenPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [examen, setExamen] = useState<Examen | null>(null);
  const [examenAleatorio, setExamenAleatorio] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingResult, setProcessingResult] = useState(false);
  const [respuestas, setRespuestas] = useState<RespuestaUsuario[]>([]);
  const [intento, setIntento] = useState(1);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [notaFallida, setNotaFallida] = useState<number | null>(null);

  useEffect(() => {
    if (courseId && user?.uid) {
      // Primero verificar el último intento antes de cargar el examen
      loadUltimoIntento();
    }
  }, [courseId, user?.uid]);

  const loadExamen = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const examenData = await examenService.getExamenByFormacion(courseId);
      if (!examenData) {
        toast.error('No hay examen disponible para esta formación');
        navigate(`/curso/${courseId}`);
        return;
      }
      setExamen(examenData);
      // Mezclar preguntas aleatoriamente
      const examenMezclado = mezclarPreguntas(examenData);
      setExamenAleatorio(examenMezclado);
      inicializarRespuestas(examenMezclado);
    } catch (error) {
      console.error('Error loading examen:', error);
      toast.error('Error al cargar el examen');
      navigate(`/curso/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const loadUltimoIntento = async () => {
    if (!courseId || !user?.uid) return;
    try {
      const ultimoIntento = await examenService.getUltimoIntento(user.uid, courseId);
      if (ultimoIntento) {
        // Si el último intento fue aprobado, no permitir más intentos
        if (ultimoIntento.aprobado) {
          setLoading(false);
          toast.success('Ya has aprobado este examen. Puedes descargar tu certificado.');
          navigate(`/curso/${courseId}`, { 
            replace: true,
            state: { 
              examenYaAprobado: true,
              mostrarCertificado: true
            }
          });
          return;
        }
        setIntento(ultimoIntento.intento + 1);
      }
      // Solo cargar el examen si no está aprobado
      await loadExamen();
    } catch (error) {
      console.error('Error loading ultimo intento:', error);
      // Si hay error verificando, intentar cargar el examen de todas formas
      await loadExamen();
    }
  };

  const mezclarPreguntas = (examenOriginal: Examen): Examen => {
    // Crear copia profunda del examen
    const examenCopia = JSON.parse(JSON.stringify(examenOriginal));
    
    // Mezclar preguntas
    const preguntasMezcladas = [...examenCopia.preguntas].sort(() => Math.random() - 0.5);
    
    // Mezclar respuestas dentro de cada pregunta
    preguntasMezcladas.forEach((pregunta) => {
      pregunta.respuestas = [...pregunta.respuestas].sort(() => Math.random() - 0.5);
    });

    return {
      ...examenCopia,
      preguntas: preguntasMezcladas,
    };
  };

  const inicializarRespuestas = (examenData: Examen) => {
    const respuestasIniciales: RespuestaUsuario[] = examenData.preguntas.map((pregunta) => ({
      preguntaId: pregunta.id,
      respuestaIds: [],
    }));
    setRespuestas(respuestasIniciales);
  };

  // Determinar si una pregunta tiene múltiples respuestas correctas
  const esMultipleRespuesta = (preguntaId: string): boolean => {
    if (!examenAleatorio) return false;
    const pregunta = examenAleatorio.preguntas.find((p) => p.id === preguntaId);
    if (!pregunta) return false;
    const correctas = pregunta.respuestas.filter((r) => r.esCorrecta).length;
    return correctas > 1;
  };

  const toggleRespuesta = (preguntaId: string, respuestaId: string, esMultiple: boolean) => {
    setRespuestas((prev) =>
      prev.map((respuesta) => {
        if (respuesta.preguntaId === preguntaId) {
          if (esMultiple) {
            // Checkbox: agregar o quitar de la lista
            const respuestaIds = [...respuesta.respuestaIds];
            const index = respuestaIds.indexOf(respuestaId);
            
            if (index > -1) {
              respuestaIds.splice(index, 1);
            } else {
              respuestaIds.push(respuestaId);
            }
            
            return { ...respuesta, respuestaIds };
          } else {
            // Radio button: reemplazar con solo esta respuesta
            return { ...respuesta, respuestaIds: [respuestaId] };
          }
        }
        return respuesta;
      })
    );
  };

  const validarRespuestas = (): boolean => {
    if (!examenAleatorio) return false;
    
    // Verificar que todas las preguntas tengan al menos una respuesta
    const todasRespondidas = examenAleatorio.preguntas.every((pregunta) => {
      const respuesta = respuestas.find((r) => r.preguntaId === pregunta.id);
      return respuesta && respuesta.respuestaIds.length > 0;
    });

    if (!todasRespondidas) {
      toast.error('Por favor, responde todas las preguntas');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!examen || !examenAleatorio || !user?.uid || !courseId) return;

    if (!validarRespuestas()) return;

    try {
      setSubmitting(true);

      // Calcular nota
      const notaCalculada = examenService.calcularNota(examen, respuestas);
      const aprobadoCalculado = notaCalculada >= 70;

      // Guardar examen realizado
      try {
        await examenService.guardarExamenRealizado({
          id_examen: examen.id,
          id_formacion: courseId,
          id_usuario: user.uid,
          respuestas,
          nota: notaCalculada,
          aprobado: aprobadoCalculado,
          intento,
          fecha_realizado: new Date().toISOString(),
        });
      } catch (submitError: any) {
        // Si el error es porque ya aprobó, redirigir al curso
        if (submitError.response?.data?.yaAprobado) {
          toast.success('Ya has aprobado este examen anteriormente');
          navigate(`/curso/${courseId}`, { 
            replace: true,
            state: { 
              examenYaAprobado: true,
              mostrarCertificado: true
            }
          });
          return;
        }
        throw submitError; // Re-lanzar si es otro tipo de error
      }

      setSubmitting(false);

      if (aprobadoCalculado) {
        // Mostrar loader profesional mientras procesa
        setProcessingResult(true);
        toast.success(`¡Felicitaciones! Has aprobado el examen con ${notaCalculada}%`);
        
        // Esperar que se vea el loader antes de navegar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navegar con datos locales después de aprobar
        navigate(`/curso/${courseId}`, { 
          state: { 
            examenCompletado: true,
            aprobado: true,
            intento: intento,
            certificadoListo: true,
            timestamp: Date.now() // Para forzar re-render
          },
          replace: false
        });
      } else {
        // Mostrar modal de desaprobación en lugar de solo toast
        setNotaFallida(notaCalculada);
        setShowFailureModal(true);
      }
    } catch (error: any) {
      console.error('Error submitting examen:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el examen');
      setSubmitting(false);
      setProcessingResult(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (processingResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
              ¡Examen Aprobado!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Generando tu certificado...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examenAleatorio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay examen disponible</AlertTitle>
          <AlertDescription>
            No se encontró un examen para esta formación.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleReintentarExamen = () => {
    setShowFailureModal(false);
    // Recargar la página para obtener un nuevo examen aleatorio
    window.location.reload();
  };

  const handleVolverAFormacion = () => {
    setShowFailureModal(false);
    navigate(`/curso/${courseId}`, { 
      state: { 
        examenCompletado: true,
        aprobado: false,
        intento: intento,
        examenFallido: true
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Modal de desaprobación */}
      <Dialog open={showFailureModal} onOpenChange={setShowFailureModal}>
        <DialogContent className="sm:max-w-md border-2 border-primary/20">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="w-16 h-16 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl text-primary">
              Examen Desaprobado
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              No has alcanzado el 70% requerido para aprobar el examen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-3xl font-bold text-primary mb-2">
              {notaFallida?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tu puntuación obtenida
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleVolverAFormacion}
              className="w-full sm:w-auto border-primary/20 hover:bg-primary/10 hover:text-primary"
            >
              Volver a la formación
            </Button>
            <Button
              onClick={handleReintentarExamen}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Reintentar examen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{examenAleatorio.titulo}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Intento {intento}
            </p>
          </CardHeader>
        </Card>

        {/* Preguntas */}
        <div className="space-y-6">
          {examenAleatorio.preguntas.map((pregunta, index) => {
            const respuestaUsuario = respuestas.find((r) => r.preguntaId === pregunta.id);
            const respuestasSeleccionadas = respuestaUsuario?.respuestaIds || [];
            const esMultiple = esMultipleRespuesta(pregunta.id);

            return (
              <Card key={pregunta.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Pregunta {index + 1}: {pregunta.texto}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {esMultiple ? (
                    // Checkboxes para múltiples respuestas
                    pregunta.respuestas.map((respuesta) => {
                      const isChecked = respuestasSeleccionadas.includes(respuesta.id);

                      return (
                        <div
                          key={respuesta.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${
                            isChecked
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                          }`}
                        >
                          <Checkbox
                            id={`${pregunta.id}-${respuesta.id}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleRespuesta(pregunta.id, respuesta.id, esMultiple)}
                            disabled={submitting}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={`${pregunta.id}-${respuesta.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {respuesta.texto}
                          </Label>
                        </div>
                      );
                    })
                  ) : (
                    // Radio buttons para una sola respuesta
                    <RadioGroup
                      value={respuestasSeleccionadas[0] || ''}
                      onValueChange={(value) => toggleRespuesta(pregunta.id, value, esMultiple)}
                      disabled={submitting}
                    >
                      {pregunta.respuestas.map((respuesta) => {
                        const isChecked = respuestasSeleccionadas.includes(respuesta.id);

                        return (
                          <div
                            key={respuesta.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${
                              isChecked
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                          >
                            <RadioGroupItem
                              id={`${pregunta.id}-${respuesta.id}`}
                              value={respuesta.id}
                              disabled={submitting}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`${pregunta.id}-${respuesta.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              {respuesta.texto}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`/curso/${courseId}`)}
            disabled={submitting}
          >
            Volver al Curso
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="min-w-[150px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Examen'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

