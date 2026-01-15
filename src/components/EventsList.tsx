import { useState, useEffect } from "react";
import { Evento } from "@/types/types";
import eventService from "@/services/eventService";
import EventCard from "./EventCard";
import { Calendar, Loader2 } from "lucide-react";

export const EventsList = () => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const fetchEvents = async () => {
            const events = await eventService.getAll();
            setEvents(events);
            setIsLoading(false);
        }
        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                    Aún no tienes eventos registrados. Cuando te inscribas a un evento, aparecerá aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 ml-1 mt-10">
                Descubre nuestros eventos disponibles
            </h2>
            {events.map((event) => <EventCard key={event.id} evento={event} showPrice={true} clickeable={true} />)}
        </div>
    )
}