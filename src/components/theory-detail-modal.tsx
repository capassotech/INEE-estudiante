
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Clock, BookOpen, CheckCircle, PlayCircle } from "lucide-react"
import { useState } from "react"
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder"

interface TheoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  content: {
    id: string
    title: string
    description: string
    type: "PDF" | "DOCX"
    url: string
    duration?: string
    topics?: string[]
    moduleName?: string
  } | null
}

const TheoryDetailModal = ({ isOpen, onClose, content }: TheoryDetailModalProps) => {
  const [isCompleted, setIsCompleted] = useState(false)

  if (!content) return null

  // Contenido detallado simulado (en una app real vendría del backend)
  const detailedContent = {
    title: content.title,
    readTime: content.duration?.replace("Lectura ", "") || "30 min",
    completed: isCompleted,
    sections: [
      {
        id: "introduccion",
        title: "Introducción",
        content: `${content.description}\n\nEste material forma parte del ${content.moduleName} y cubre los aspectos fundamentales del tema.`,
        image: "/placeholder.svg?height=300&width=600",
        videoEmbed: null,
      },
      {
        id: "desarrollo",
        title: "Desarrollo del Tema",
        content: `**Conceptos Clave:**\n\n- Definiciones fundamentales\n- Aplicaciones prácticas\n- Ejemplos ilustrativos\n\nEl contenido se desarrolla de manera progresiva, permitiendo una comprensión integral del tema.`,
        image: null,
        videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "conclusion",
        title: "Conclusiones",
        content: `**Puntos Importantes:**\n\n- Resumen de conceptos principales\n- Aplicación en el contexto del fitness grupal\n- Conexión con otros módulos del curso\n\nEste conocimiento es fundamental para el desarrollo profesional en el área.`,
        image: null,
        videoEmbed: null,
      },
    ],
    quiz: {
      question: `¿Cuál es el concepto más importante relacionado con ${content.title}?`,
      options: [
        "La aplicación práctica en el entrenamiento",
        "La base teórica fundamental",
        "La conexión con otros sistemas",
        "Todas las anteriores",
      ],
      correct: 3,
    },
  }

  const markAsCompleted = () => {
    setIsCompleted(!isCompleted)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="outline">{content.type}</Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{detailedContent.readTime}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogTitle className="text-xl font-bold">{detailedContent.title}</DialogTitle>
          {content.moduleName && <p className="text-sm text-gray-600 dark:text-gray-300">{content.moduleName}</p>}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Card */}
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6" />
                  <div>
                    <h3 className="font-medium">Progreso de Lectura</h3>
                    <p className="text-sm text-purple-100">{detailedContent.sections.length} secciones por leer</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={markAsCompleted}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isCompleted ? "Completado" : "Marcar Completada"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-6">
            {detailedContent.sections.map((section, index) => (
              <Card key={section.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{section.title}</h2>
                  </div>

                  {section.image && (
                    <ImageWithPlaceholder
                      src={section.image || "/placeholder.svg"}
                      alt={section.title}
                      className="rounded-lg"
                      aspectRatio="auto"
                      style={{ height: '12rem' }}
                      placeholderIcon="image"
                      placeholderText=""
                    />
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    {section.content.split("\n").map((paragraph, pIndex) => {
                      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                        return (
                          <h3 key={pIndex} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
                            {paragraph.slice(2, -2)}
                          </h3>
                        )
                      } else if (paragraph.startsWith("- ")) {
                        return (
                          <li key={pIndex} className="text-gray-600 dark:text-gray-300 ml-4">
                            {paragraph.slice(2)}
                          </li>
                        )
                      } else if (paragraph.trim()) {
                        return (
                          <p key={pIndex} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            {paragraph
                              .split("**")
                              .map((part, partIndex) =>
                                partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part,
                              )}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>

                  {section.videoEmbed && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Video Complementario</h3>
                      </div>
                      <div className="aspect-video bg-gray-900 rounded-lg">
                        <iframe
                          src={section.videoEmbed}
                          title={`Video: ${section.title}`}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quiz Section */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Pregunta de Autoevaluación
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{detailedContent.quiz.question}</p>
              <div className="space-y-2">
                {detailedContent.quiz.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3 hover:bg-orange-100 dark:hover:bg-orange-900/30 bg-transparent"
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Download Original Document */}
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold mb-2">Documento Original</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Descarga el archivo {content.type} completo para estudiar offline
              </p>
              <Button variant="outline" onClick={() => window.open(content.url, "_blank")}>
                Descargar {content.type}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TheoryDetailModal
