import { Link } from "react-router-dom";
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function TestVocacional() {
    const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""])

    const questions = [
        {
            id: 1,
            question: "Cuando pienso en mi futuro profesional, me motiva más…",
            options: {
                A: "Crear y escalar mi propio negocio.",
                B: "Acompañar a otras organizaciones a resolver problemas estratégicos.",
                C: "Inspirar y guiar equipos para que den lo mejor de sí."
            }
        },
        {
            id: 2,
            question: "En mi día a día disfruto más…",
            options: {
                A: "Analizar datos, diagnosticar y diseñar planes de acción.",
                B: "Detectar oportunidades de negocio e innovar con nuevas ideas.",
                C: "Motivar a otros, comunicarme y generar impacto en las personas.  "
            }
        },
        {
            id: 3,
            question: "Cuando surge un problema complejo…",
            options: {
                A: "Pienso cómo transformarlo en una oportunidad para crecer.",
                B: "Busco cómo alinear al equipo y mantener la motivación.",
                C: "Analizo la raíz del problema y propongo soluciones prácticas."
            }
        },
        {
            id: 4,
            question: "Si pudiera elegir un rol mañana mismo, sería…",
            options: {
                A: "Consultor/a estratégico que asesora a empresas y líderes.",
                B: "Director/a de un equipo que lidera proyectos desafiantes.",
                C: "Fundador/a de una startup innovadora."
            }
        },
        {
            id: 5,
            question: "Lo que más me gustaría aprender en INEE es…",
            options: {
                A: "Cómo analizar mejor distintas situaciones, interpretar datos y tomar decisiones con fundamento.",
                B: "Formas de motivar a las personas, gestionar procesos de cambio y fortalecer culturas de trabajo.",
                C: "Métodos para convertir ideas en proyectos concretos, validarlos y darles proyección de crecimiento."
            }
        }
    ]

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setAnswers(prev => {
            const newAnswers = [...prev]
            newAnswers[questionIndex] = answer.toLowerCase()
            return newAnswers
        })
    }

    const handleSubmit = () => {
        console.log('Respuestas:', answers)
        // Aquí puedes agregar la lógica para procesar las respuestas
    }

    const isComplete = answers.every(answer => answer !== "")

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
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map((question, index) => (
                            <div key={question.id} className="space-y-3">
                                <h3 className="font-semibold text-gray-800">
                                    {index + 1}. {question.question}
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(question.options).map(([key, value]) => (
                                        <label
                                            key={key}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={key}
                                                checked={answers[index] === key.toLowerCase()}
                                                onChange={() => handleAnswerChange(index, key)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">
                                                <strong>{key})</strong> {value}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-6 border-t w-full flex items-center gap-4 justify-center">
                            <Button
                                onClick={handleSubmit}
                                disabled={!isComplete}
                                className="w-3/4 py-3 text-lg"
                            >
                                {isComplete ? 'Ver Resultados' : `Responde todas las preguntas (${answers.filter(a => a !== "").length}/${questions.length})`}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setAnswers(["", "", "", "", ""])}
                                asChild
                                className="w-1/4 py-3 text-lg"
                            >
                                <Link to="/perfil">Omitir</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}