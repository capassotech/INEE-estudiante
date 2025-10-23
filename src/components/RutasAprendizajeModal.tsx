
import { useState } from "react";
import { DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

const rutasAprendizaje = [
    {
        id: 1,
        nombre: "Consultoría",
        route_name: "consultoria",
        descripcion: "Desarrolla habilidades analíticas y estratégicas para resolver problemas complejos en organizaciones. Aprende a diagnosticar situaciones, proponer soluciones y generar valor como asesor experto.",
        color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
        badgeColor: "bg-blue-100 text-blue-800"
    },
    {
        id: 2,
        nombre: "Liderazgo",
        route_name: "liderazgo",
        descripcion: "Fortalece tu capacidad para inspirar, motivar y guiar equipos hacia el éxito. Domina la gestión de personas, la toma de decisiones y la creación de ambientes de alto rendimiento.",
        color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
        badgeColor: "bg-purple-100 text-purple-800"
    },
    {
        id: 3,
        nombre: "Emprendimiento",
        route_name: "emprendimiento",
        descripcion: "Convierte ideas en negocios reales. Aprende a identificar oportunidades, validar modelos de negocio, gestionar recursos y construir proyectos innovadores desde cero.",
        color: "bg-green-50 border-green-200 hover:bg-green-100",
        badgeColor: "bg-green-100 text-green-800"
    },
    {
        id: 4,
        nombre: "Consultor-Líder",
        route_name: "consultor-lider",
        descripcion: "Combina expertise técnico con habilidades de gestión. Lidera proyectos de consultoría mientras diriges equipos multidisciplinarios y generas impacto estratégico en las organizaciones.",
        color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
        badgeColor: "bg-indigo-100 text-indigo-800"
    },
    {
        id: 5,
        nombre: "Líder-Emprendedor",
        route_name: "lider-emprendedor",
        descripcion: "Aprende a construir y escalar equipos mientras desarrollas tu propia visión empresarial. Ideal para quienes quieren liderar su propio proyecto con una mentalidad innovadora y orientada al crecimiento.",
        color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
        badgeColor: "bg-amber-100 text-amber-800"
    },
    {
        id: 6,
        nombre: "Emprendedor-Consultor",
        route_name: "emprendedor-consultor",
        descripcion: "Desarrolla negocios propios mientras ofreces tu expertise como asesor independiente. Combina la autonomía del emprendimiento con la versatilidad de la consultoría freelance o corporativa.",
        color: "bg-rose-50 border-rose-200 hover:bg-rose-100",
        badgeColor: "bg-rose-100 text-rose-800"
    }
];

interface RutasAprendizajeModalProps {
    isOpen: boolean;
    onClose: () => void;
    perfilActual: string;
    onSelectRoute?: (routeName: string) => void;
}

export default function RutasAprendizajeModal({ 
    isOpen, 
    onClose, 
    perfilActual, 
    onSelectRoute 
}: RutasAprendizajeModalProps) {
    const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

    const handleSelectRoute = (routeId: number) => {
        setSelectedRoute(routeId);
    };

    const handleConfirmSelection = () => {
        if (selectedRoute && onSelectRoute) {
            const selectedRouteName = rutasAprendizaje.find(r => r.id === selectedRoute)?.route_name || '';
            onSelectRoute(selectedRouteName);
        }
        onClose();
    };

    const handleCancel = () => {
        setSelectedRoute(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="max-w-4xl h-fit max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Rutas de Aprendizaje
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        Selecciona tu nueva ruta de aprendizaje predominante
                    </DialogDescription>
                    {perfilActual && (
                        <div className="flex justify-center mt-2">
                            <Badge variant="outline" className="text-sm">
                                Perfil actual: {perfilActual}
                            </Badge>
                        </div>
                    )}
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {rutasAprendizaje.map((ruta) => (
                        <Card 
                            key={ruta.id} 
                            className={`cursor-pointer transition-all duration-200 ${ruta.color} ${
                                selectedRoute === ruta.id 
                                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                                    : 'hover:shadow-md'
                            }`}
                            onClick={() => handleSelectRoute(ruta.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {ruta.nombre}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {perfilActual === ruta.route_name && (
                                            <Badge className={ruta.badgeColor}>
                                                Actual
                                            </Badge>
                                        )}
                                        {selectedRoute === ruta.id ? (
                                            <CheckCircle2 className="h-6 w-6 text-primary" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm text-gray-700 leading-relaxed">
                                    {ruta.descripcion}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmSelection}
                        disabled={!selectedRoute}
                        className="w-full sm:w-auto"
                    >
                        {selectedRoute ? 'Confirmar Selección' : 'Selecciona una ruta'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}