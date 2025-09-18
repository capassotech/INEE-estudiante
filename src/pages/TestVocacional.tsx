import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../contexts/AuthContext'
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress"


export default function TestVocacional() {
    const { testVocacional, loadQuestion } = useAuth()
    const [answers, setAnswers] = useState<{[key: string]: string}>({}) 
    const [currentQuestionData, setCurrentQuestionData] = useState<{
        id?: string,
        texto: string,
        respuestas: any[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [totalQuestions] = useState(5) 
    const navigate = useNavigate()

    const progress = (Object.keys(answers).length / totalQuestions) * 100

    const loadCurrentQuestion = useCallback(async (step: number) => {
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
            console.error('Error cargando pregunta:', error)
            toast.error('Error al cargar la pregunta')
        } finally {
            setIsLoadingQuestion(false)
        }
    }, [loadQuestion])

    useEffect(() => {
        loadCurrentQuestion(currentStep)
    }, [currentStep, loadCurrentQuestion])

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
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
            await loadCurrentQuestion(nextStep)
        }
    }

    const handlePrevious = async () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1
            setCurrentStep(prevStep)
            await loadCurrentQuestion(prevStep)
        }
    }

    const getCurrentQuestionId = () => currentQuestionData?.id || `p${currentStep}`
    const isCurrentQuestionAnswered = answers[getCurrentQuestionId()] !== undefined
    const isLastQuestion = currentStep === totalQuestions

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const answersArray = Object.values(answers)
            await testVocacional(answersArray)
            toast.success('Respuestas enviadas correctamente')
            navigate('/perfil')
        } catch (error) {
            console.error('Error al procesar las respuestas:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-hero dark:bg-gradient-hero-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8">
                        <div className="flex items-center space-x-2">
                            <div className="h-10 rounded-lg flex items-center justify-center">
                                <img src="/logo-blanco.png" alt="INEE Logo" className="h-20" />
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-4">Test Vocacional</h1>
                    <p className="text-white/80">Responde las siguientes preguntas para descubrir tu orientación vocacional</p>
                </div>
                
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-center text-gray-800">Cuestionario Vocacional</CardTitle>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Pregunta {currentStep} de {totalQuestions}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 bg-zinc-300" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoadingQuestion ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Cargando pregunta...</p>
                            </div>
                        ) : currentQuestionData ? (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 text-lg">
                                    {currentQuestionData.texto}
                                </h3>
                                <div className="space-y-3">
                                    {currentQuestionData.respuestas && currentQuestionData.respuestas.map((respuesta: string, index: number) => {
                                        const optionKey = String.fromCharCode(65 + index);
                                        return (
                                            <label
                                                key={index}
                                                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentStep}`}
                                                    value={optionKey}
                                                    checked={answers[getCurrentQuestionId()] === optionKey.toLowerCase()}
                                                    onChange={() => handleAnswerChange(optionKey)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">
                                                    <strong>{optionKey}.</strong> {respuesta.texto}
                                                </span>
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
                                    asChild
                                    disabled={isLoading || isLoadingQuestion}
                                    className="px-6 py-2"
                                >
                                    <Link to="/perfil">Omitir</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}