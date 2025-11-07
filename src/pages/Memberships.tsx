
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Check,
    Infinity as InfinityIcon,
    Users,
    Award,
    Headphones,
    Star,
    BookOpen,
    Shield,
    CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import membershipService from "@/services/membershipService";
import { Membership } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";

const Memberships = () => {
    const [membershipPlans, setMembershipPlans] = useState<Membership[]>([]);
    const [userMembership, setUserMembership] = useState<Membership | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => { 
        fetchMembershipPlans() 
        if (user) {
            fetchUserMembership(user.membresia);
        }
    }, [user]);

    const fetchUserMembership = async (membresiaId: string) => {
        setIsLoading(true);
        const data = await membershipService.getMembresia(membresiaId);
        setUserMembership(data.data);
        setIsLoading(false);
    }

    const fetchMembershipPlans = async () => {
        setIsLoading(true);
        const data = await membershipService.getMembresias();   
        const sortedPlans = data.data.sort((a, b) => a.precio - b.precio);
        setMembershipPlans(sortedPlans);
        setIsLoading(false)
    };

    const benefits = [
        {
            icon: <InfinityIcon className="w-8 h-8" />,
            title: "Acceso Ilimitado",
            description:
                "Aprende a tu ritmo sin restricciones durante 12 meses completos",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Comunidad Activa",
            description:
                "Conecta con +50,000 estudiantes y profesionales de todo el mundo",
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Certificaciones",
            description:
                "Obtén certificados reconocidos que potencien tu perfil profesional",
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: "Soporte Experto",
            description:
                "Recibe ayuda personalizada de nuestro equipo de especialistas",
        },
    ];

    const MembershipCardSkeleton = () => {
        return (
            <Card className="relative shadow-xl w-full max-w-md overflow-visible">
                <CardHeader className="text-center pb-6">
                    <Skeleton className="h-8 w-40 mx-auto mb-4" />
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                            <Skeleton className="h-16 w-32" />
                            <div className="text-center">
                                <Skeleton className="h-5 w-20 mb-2" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-hero text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            Un acceso. Toda la formación. Impacto real.
                        </h1>
                        <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                            No es solo aprender, es transformar tu camino. Sumate al desafío
                            de crecer con propósito e impactar desde donde más importa.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {isLoading ? (
                    <div className="flex md:flex-row flex-col justify-around gap-10 mb-16 pt-6">
                        {[1, 2, 3].map((index) => (
                            <MembershipCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="flex md:flex-row flex-col justify-around gap-10 mb-16 pt-6">
                        {membershipPlans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`relative md:hover:scale-105 p-2 hover:shadow-2xl bg-white hover:bg-gray-50 transition-all duration-300 border-0 shadow-xl w-full max-w-md overflow-visible ${plan.nombre == userMembership?.nombre
                                    ? "ring-2 ring-brand-primary-500"
                                    : ""
                                    }`}
                            >
                                {plan.nombre === userMembership?.nombre && (
                                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 text-white px-3 py-1 text-xs font-semibold shadow-md z-10 rounded-full">
                                        <CheckCircle className="w-3 h-3 mr-1 inline" />
                                        Membresía actual
                                    </Badge>
                                )}

                                <CardHeader className="text-center pb-6">
                                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.nombre}
                                    </CardTitle>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-5xl font-bold text-gray-900">
                                                ${plan.precio.toLocaleString()}
                                            </span>
                                            {plan.old_price && (
                                                <div className="text-center">
                                                    <span className="text-lg text-gray-500 line-through block">
                                                        ${plan.old_price.toLocaleString()}
                                                    </span>
                                                    <Badge variant="destructive" className="text-xs mt-1">
                                                        -
                                                        {Math.round(
                                                            ((plan.old_price - plan.precio) /
                                                                plan.old_price) *
                                                            100
                                                        )}
                                                        %
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <Card className="flex flex-col h-fit max-h-[700px]">
                                    <CardContent className="flex flex-col h-full p-6">
                                        <div
                                            className={`space-y-3 flex-grow ${plan.nombre === "Membresia 3" ? "text-xs" : "text-sm"
                                                }`}
                                        >
                                            <div className="rounded-lg p-3 border border-gray-200 bg-white">
                                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                                                    Incluido en tu membresía:
                                                </h4>
                                                <ul className="space-y-0.5">
                                                    {plan.descripcion
                                                        ?.split(/[\n]+/)
                                                        .map(
                                                            (item, idx) =>
                                                                item.trim() && (
                                                                    <li
                                                                        key={idx}
                                                                        className="flex items-start text-gray-800 leading-snug"
                                                                    >
                                                                        <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-brand-primary-500" />
                                                                        <span>{item.trim()}</span>
                                                                    </li>
                                                                )
                                                        )}
                                                </ul>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2 mb-2">
                                                <div className="flex items-center justify-center text-xs text-gray-600">
                                                    <Shield className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                                    <span>Garantía de 30 días • Cancela cuando quieras</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* <div className="mt-auto space-y-1">
                                            {plan. && (
                                                <Link to={`/checkout`} className="block">
                                                    <Button
                                                        className={`w-full py-2.5 text-sm font-semibold transition-all duration-200 ${plan.nombre === "Membresia 2"
                                                            ? "bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 hover:from-brand-primary-600 hover:to-brand-primary-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                            : "btn-gradient hover:shadow-md"
                                                            }`}
                                                    >
                                                        Seleccionar Plan
                                                    </Button>
                                                </Link>
                                            )}

                                            <div className="text-center space-y-1 text-xs text-gray-500">
                                                <p>Sin compromisos • Política de reembolso completo</p>
                                                {plan.nombre === "Membresia 2" && (
                                                    <p className="text-blue-600 font-medium">⚡ ¡Oferta limitada!</p>
                                                )}
                                            </div>
                                        </div> */}
                                    </CardContent>
                                </Card>


                            </Card>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            ¿Por qué elegir nuestra membresía?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Más que formaciones individuales, una experiencia de aprendizaje completa
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center">
                                <div className="flex items-center justify-center w-16 h-16 bg-brand-primary-100 rounded-full mx-auto mb-4">
                                    <div className="text-brand-primary-600">{benefit.icon}</div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 text-sm text-center max-w-xs mx-auto">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Preguntas Frecuentes
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                question: "¿Puedo cancelar mi membresía en cualquier momento?",
                                answer:
                                    "Sí, puedes cancelar tu membresía cuando desees. Mantendrás el acceso hasta que termine tu período de facturación actual.",
                            },
                            {
                                question: "¿Los certificados tienen validez profesional?",
                                answer:
                                    "Nuestra certificación privada cuenta con sello ISO 9001, garantizando un aprendizaje de calidad.  Además, contamos con aval universitario.",
                            },
                            {
                                question: "¿Hay contenido actualizado?",
                                answer:
                                    "Sí, mantenemos en constante actualización nuestras formaciones on demand y asincrónicas.",
                            },
                            {
                                question: "¿Puedo acceder desde cualquier dispositivo?",
                                answer:
                                    "Completamente. Nuestra plataforma es compatible con computadoras, tablets y smartphones.",
                            },
                        ].map((faq, index) => (
                            <div key={index} className="space-y-2">
                                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                                <p className="text-gray-600 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para transformar tu presente y futuro con impacto?
          </h2>
          <p className="text-gray-600 mb-8">
            Únete a nuestra comunidad de profesionales que ya están creciendo
            con nosotros
          </p>

          <Link to={`/checkout`} className="block mb-6">
            <Button className="btn-gradient px-8 py-3">
              Comenzar mi membresía ahora
            </Button>
          </Link>

          <Link to={`/contacto`} className="block mb-6">
            <Button
              variant="outline"
              className="px-8 py-3 min-w-[275px]"
            >
              ¿Tienes dudas? ¡Contáctanos!
            </Button>
          </Link>
        </div> */}
            </div>
        </div>
    );
};

export default Memberships;
