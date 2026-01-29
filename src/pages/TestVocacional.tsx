import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../contexts/AuthContext'
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress"
import Swal from 'sweetalert2'
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle } from 'lucide-react';
import RutasAprendizajeModal from '../components/RutasAprendizajeModal';
import authService from '../services/authService';
import { auth } from '../../config/firebase-client';


const rutasAprendizaje = [
    { route_name: "consultoria", nombre: "Consultoría" },
    { route_name: "liderazgo", nombre: "Liderazgo" },
    { route_name: "emprendimiento", nombre: "Emprendimiento" },
    { route_name: "consultor-lider", nombre: "Consultor-Líder" },
    { route_name: "lider-emprendedor", nombre: "Líder-Emprendedor" },
    { route_name: "emprendedor-consultor", nombre: "Emprendedor-Consultor" }
];

const getPerfilNombre = (routeName: string | null): string => {
    if (!routeName) return "No determinado";
    const ruta = rutasAprendizaje.find(r => r.route_name === routeName);
    return ruta ? ruta.nombre : routeName;
};

export default function TestVocacional() {
    const { testVocacional, loadQuestion, savePartialAnswers, user, refreshUser, updateRouteUser } = useAuth()
    const [answers, setAnswers] = useState<{ [key: string]: string }>({})
    const [currentQuestionData, setCurrentQuestionData] = useState<{
        id?: string,
        texto: string,
        respuestas: { texto: string }[] | string[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
    const [currentStep, setCurrentStep] = useState(null)
    const [totalQuestions] = useState(5)
    const [isRutasModalOpen, setIsRutasModalOpen] = useState(false)
    const navigate = useNavigate()
    

    const progress = (currentStep / totalQuestions) * 100
    
    // Función para determinar el color de la barra de progreso
    const getProgressColor = (progressValue: number): string => {
        if (progressValue <= 33) {
            return 'bg-red-500'; // Rojo para el inicio (0-33%)
        } else if (progressValue <= 66) {
            return 'bg-yellow-500'; // Amarillo para el medio (34-66%)
        } else {
            return 'bg-green-500'; // Verde para el final (67-100%)
        }
    }
    
    const progressColor = getProgressColor(progress)

    const loadCurrentQuestion = useCallback(async (step: number) => {
        if (step === null) return

        setIsLoadingQuestion(true)
        try {
            const questionData = await loadQuestion(`p${step}`)
            const question = Array.isArray(questionData) ? questionData[0] : questionData
            const formattedData = {
                id: `p${step}`,
                texto: question?.texto || '',
                respuestas: question?.respuestas
            }

            setCurrentQuestionData(formattedData)
        } catch (error) {
            toast.error('Error al cargar la pregunta')
        } finally {
            setIsLoadingQuestion(false)
        }
    }, [loadQuestion])

    const convertResponseIdToLetter = (responseId: string): string => {
        const number = parseInt(responseId.replace('r', ''))
        const letterIndex = (number - 1) % 3
        return String.fromCharCode(97 + letterIndex)
    }

    useEffect(() => {
        if (user?.respuestas_test_vocacional && user.respuestas_test_vocacional.length > 0) {

            const savedAnswers: { [key: string]: string } = {}
            user.respuestas_test_vocacional.forEach(respuesta => {
                savedAnswers[respuesta.id_pregunta] = convertResponseIdToLetter(respuesta.id_respuesta)
            })

            setAnswers(savedAnswers)

            let nextStep = 1
            for (let i = 1; i <= totalQuestions; i++) {
                if (!savedAnswers[`p${i}`]) {
                    nextStep = i
                    break
                }
                if (i === totalQuestions) {
                    nextStep = totalQuestions
                }
            }

            setCurrentStep(nextStep)
        } else {
            setCurrentStep(1)
        }
    }, [user, totalQuestions])

    useEffect(() => { loadCurrentQuestion(currentStep) }, [currentStep, loadCurrentQuestion])

    const handleAnswerChange = (answer: string) => {
        if (currentQuestionData) {
            setAnswers(prev => ({
                ...prev,
                [currentQuestionData.id || `p${currentStep}`]: answer.toLowerCase()
            }))
        }
    }

    const handleNext = async () => {
        if (currentStep < totalQuestions) {
            const currentQuestionId = getCurrentQuestionId()
            const currentAnswer = answers[currentQuestionId]

            if (currentAnswer) {
                const existingResponse = user?.respuestas_test_vocacional?.find(
                    respuesta => respuesta.id_pregunta === currentQuestionId
                )

                const shouldSave = !existingResponse ||
                    convertResponseIdToLetter(existingResponse.id_respuesta) !== currentAnswer

                if (shouldSave) {
                    try {
                        await savePartialAnswers(currentQuestionId, currentAnswer)
                    } catch (error) {
                        console.error('Error al guardar respuesta parcial:', error)
                        toast.error('Error al guardar la respuesta')
                        return
                    }
                } else {
                }
            }

            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1
            setCurrentStep(prevStep)
        }
    }

    const getCurrentQuestionId = () => `p${currentStep}`
    const isCurrentQuestionAnswered = answers[getCurrentQuestionId()] !== undefined
    const isLastQuestion = currentStep === totalQuestions

    const handleSelectRoute = async (routeName: string) => {
        setIsRutasModalOpen(false);
        try {
            await updateRouteUser(routeName);
            toast.success("Ruta de aprendizaje actualizada correctamente");
            // Esperar un momento para asegurar que el contexto se actualice
            await new Promise(resolve => setTimeout(resolve, 500));
            // Navegar al perfil después de actualizar la ruta
            navigate('/perfil');
        } catch (error) {
            console.error('Error al actualizar la ruta:', error);
            toast.error('Error al actualizar la ruta de aprendizaje');
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            await savePartialAnswers(getCurrentQuestionId(), answers[getCurrentQuestionId()])
            const answersArray = Object.values(answers)
            await testVocacional(answersArray)
            
            // Esperar a que el backend procese el test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Obtener el perfil REAL directamente del backend con múltiples intentos
            // NO usar el contexto, solo el backend que tiene el perfil calculado
            let perfilPredominante: string | null = null;
            let nombrePerfil = "No determinado";
            
            // Intentar obtener el perfil del backend con varios reintentos
            for (let intento = 0; intento < 6; intento++) {
                try {
                    // Forzar refresco del token antes de obtener el perfil
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        await currentUser.getIdToken(true);
                    }
                    
                    const profile = await authService.getProfile();
                    if (profile && profile.ruta_aprendizaje) {
                        perfilPredominante = profile.ruta_aprendizaje;
                        nombrePerfil = getPerfilNombre(perfilPredominante);
                        // Actualizar el contexto con el perfil real
                        await refreshUser();
                        break; // Si encontramos el perfil, salir del loop
                    }
                } catch (error) {
                    console.error(`Error al obtener perfil (intento ${intento + 1}):`, error);
                }
                
                // Si no encontramos el perfil, esperar un poco más y reintentar
                if (!perfilPredominante && intento < 5) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
            
            // Si después de todos los intentos no tenemos perfil, mostrar error pero no usar contexto
            if (!perfilPredominante) {
                console.error('No se pudo obtener el perfil después de múltiples intentos');
                nombrePerfil = "Calculando...";
            }
            
            // Mostrar confetti
            confetti({
                angle: 60,
                spread: 80,
                particleCount: 200,
                origin: { x: 0 }
            });
        
            confetti({
                angle: 120,
                spread: 80,
                particleCount: 200,
                origin: { x: 1 }
            });
            
            // Mostrar el modal ANTES de navegar
            const result = await Swal.fire({
                title: "¡RESULTADO LISTO!",
                html: `
                    <div style="text-align: center;">
                        <p style="margin-bottom: 20px; font-size: 16px;">
                            ¡Lo lograste! Ahora conoce tu perfil predominante para comenzar a formarte.
                        </p>
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                    color: white; 
                                    padding: 20px; 
                                    border-radius: 10px; 
                                    margin: 20px 0;
                                    font-size: 18px;
                                    font-weight: bold;">
                            Tu perfil predominante: ${nombrePerfil}
                        </div>
                    </div>
                `,
                icon: "success",
                showCancelButton: true,
                confirmButtonText: "Ir a mis formaciones",
                cancelButtonText: "Ver todos los perfiles",
                confirmButtonColor: "#475569",
                cancelButtonColor: "#6366f1"
            });
            
            // Asegurar que el usuario se haya actualizado antes de navegar
            await refreshUser();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Si el usuario quiere ver todos los perfiles, abrir el modal
            if (result.isDismissed || result.dismiss === Swal.DismissReason.cancel) {
                setIsRutasModalOpen(true);
            } else {
                // Si confirma, navegar a las formaciones
                navigate('/');
            }
        } catch (error) {
            console.error('Error al procesar las respuestas:', error)
            toast.error('Error al procesar las respuestas del test')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f4f2f0' }}>
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8">
                        <div className="flex items-center space-x-2">
                            <div className="h-10 rounded-lg flex items-center justify-center">
                                <img src="/logo.png" alt="INEE Logo" className="h-20 dark:hidden" />
                                <img src="/logo-blanco.png" alt="INEE Logo" className="h-20 hidden dark:block" />
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Test Vocacional</h1>
                    <p className="text-slate-600 dark:text-slate-300">Responde las siguientes preguntas para descubrir tu orientación vocacional</p>
                </div>

                <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
                    {!isLoading && (
                        <CardHeader>
                            <CardTitle className="text-center text-gray-800">¿Cuál es mi perfil predominante?</CardTitle>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Pregunta {currentStep} de {totalQuestions}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="relative w-full h-2 bg-zinc-300 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ease-out rounded-full ${progressColor}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                    )}
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="text-center py-16">
                                <div className="relative mx-auto w-20 h-20 mb-6">
                                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    Analizando tus respuestas...
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    Pensando cuál es tu perfil predominante
                                </p>
                                <div className="mt-6 flex justify-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        ) : isLoadingQuestion ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Cargando pregunta...</p>
                            </div>
                        ) : currentQuestionData ? (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 text-lg">
                                    {currentQuestionData.texto}
                                </h3>
                                <div className="space-y-4">
                                    {currentQuestionData.respuestas && currentQuestionData.respuestas.map((respuesta: { texto: string } | string, index: number) => {
                                        const optionKey = String.fromCharCode(65 + index);
                                        const isSelected = answers[getCurrentQuestionId()] === optionKey.toLowerCase();
                                        return (
                                            <label
                                                key={index}
                                                className={`
                                                    flex items-start space-x-4 p-5 rounded-xl cursor-pointer transition-all duration-200
                                                    border-2 ${isSelected 
                                                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100' 
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                                    }
                                                    transform ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                                                `}
                                            >
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className={`
                                                        relative flex items-center justify-center
                                                        w-6 h-6 rounded-full border-2 transition-all duration-200
                                                        ${isSelected 
                                                            ? 'border-blue-500 bg-blue-500' 
                                                            : 'border-gray-300 bg-white'
                                                        }
                                                    `}>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                                                        )}
                                                        {!isSelected && (
                                                            <Circle className="w-4 h-4 text-gray-300" strokeWidth={2} />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start space-x-2">
                                                        <span className={`
                                                            font-bold text-lg mt-0.5
                                                            ${isSelected ? 'text-blue-600' : 'text-gray-500'}
                                                        `}>
                                                            {optionKey}.
                                                        </span>
                                                        <span className={`
                                                            text-gray-700 text-base leading-relaxed
                                                            ${isSelected ? 'font-medium' : ''}
                                                        `}>
                                                            {typeof respuesta === 'string' ? respuesta : respuesta.texto}
                                                        </span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`question-${currentStep}`}
                                                    value={optionKey}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerChange(optionKey)}
                                                    className="sr-only"
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Error al cargar la pregunta</p>
                            </div>
                        )}

                        <div className="pt-6 border-t flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1 || isLoadingQuestion}
                                className="px-6 py-2"
                            >
                                Anterior
                            </Button>

                            <div className="flex gap-3">
                                {!isLastQuestion ? (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!isCurrentQuestionAnswered || isLoadingQuestion}
                                        className="px-6 py-2"
                                    >
                                        {isLoadingQuestion ? 'Cargando...' : 'Continuar'}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!isCurrentQuestionAnswered || isLoading || isLoadingQuestion}
                                        className="px-6 py-2"
                                    >
                                        {isLoading ? 'Enviando...' : 'Enviar Resultados'}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => setIsRutasModalOpen(true)}
                                    disabled={isLoading || isLoadingQuestion}
                                    className="px-6 py-2"
                                >
                                    Omitir y elegir ruta
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <RutasAprendizajeModal 
                isOpen={isRutasModalOpen} 
                onClose={() => setIsRutasModalOpen(false)} 
                perfilActual={user?.ruta_aprendizaje || ''} 
                onSelectRoute={handleSelectRoute} 
            />
        </div>
    )
}