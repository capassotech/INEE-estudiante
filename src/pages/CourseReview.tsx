import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import reviewService from "@/services/reviewService";
import { toast } from "@/hooks/use-toast"; 
import examenService from "@/services/examenService";

const CourseReview = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const course = state?.course;

  const searchParams = new URLSearchParams(window.location.search);
  const mail = searchParams.get('mail');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSkip, setLoadingSkip] = useState(false);
  const [error, setError] = useState("");
  const [hasExamen, setHasExamen] = useState(false);

  useEffect(() => {
    const checkExam = async () => {
      const examen = await examenService.getExamenByFormacion(course.id);
      if (examen) setHasExamen(true);
    }
    checkExam();
  }, [course.id])

  const handleSubmit = async () => {
    if (!user) {
      setError("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    if (!course?.id) {
      setError("Formación no válida.");
      return;
    }

    try {
      setLoading(true);
      await reviewService.createReview(course.id, rating, comment);

      // Marcar que el usuario ya envió la reseña para este curso
      if (user?.uid) {
        try {
          const key = `review_sent_${user.uid}_${course.id}`;
          localStorage.setItem(key, "true");
          
        } catch (error) {
          console.warn("Error al guardar flag de reseña enviada:", error);
        }
      }

      toast({
        title: "¡Reseña enviada!",
        description: "Gracias por tu opinión. Serás redirigido al inicio.",
      });

      setTimeout(() => navigate(`/curso/${course.id}`), 2000);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "No se pudo enviar la reseña.",
        variant: "destructive",
      });
      setError(err.response?.data?.error || "Error al enviar la reseña");
    } finally {
      setLoading(false);
    }
  };

  const skipReview = async () => {
    try {
      setLoadingSkip(true);
      await reviewService.skipReview(user?.uid, course?.id);
      
      toast({
        title: "Reseña omitida",
        description: "Serás redirigido al inicio.",
        variant: "default",
      });
      
      // Redirigir al inicio cuando se omite la review
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Reseña omitida.",
        description: err.response?.data?.error,
        variant: "default",
      });
      
      // Redirigir al inicio incluso si hay error
      setTimeout(() => navigate("/"), 1500);
    } finally {
      setLoadingSkip(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="max-w-lg w-full shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            🎉 ¡Felicitaciones por completar tu formación!🎉
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Debes dejar una reseña para poder {hasExamen ? "realizar el examen!" : "descargar tu certificado!"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-125 ${
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-400"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <Textarea
            placeholder="Escribe un comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex justify-between mt-4">
            {!mail && (
              <Button
                variant="outline"
                onClick={skipReview}
                disabled={loadingSkip}
              >
                {loadingSkip ? "Omitiendo..." : "Omitir / Más tarde"}
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!rating || loading}>
              {loading ? "Enviando..." : "Enviar reseña"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseReview;