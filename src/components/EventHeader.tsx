import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import { siFacebook, siInstagram, siX } from "simple-icons";
import SimpleIcon from "./SimpleIcon";
import { GalleryEventDetails } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface EventHeaderProps {
    eventInfo: GalleryEventDetails | null;
}

export default function EventHeader({ eventInfo }: EventHeaderProps) {
    const { t } = useTranslation();

    if (!eventInfo) return null;

    return (
        <header className="w-full mb-8">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-[#E8F1F4]/50 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                    {/* Left Column: Photographer Logo */}
                    <div className="shrink-0 flex flex-col items-center gap-4">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                            <div className="absolute inset-0 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border-4 border-white">
                                <Image
                                    src={
                                        eventInfo.photographer.logoUrl
                                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${eventInfo.photographer.logoUrl}`
                                            : "/logo.png"
                                    }
                                    width={150}
                                    height={150}
                                    alt={eventInfo.photographer.displayName || "Photographer Logo"}
                                    className={`${eventInfo.photographer.logoUrl ? "" : "p-6 opacity-50"
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-4 justify-center text-gray-400">
                            {eventInfo.photographer.facebookUrl && (
                                <a
                                    href={eventInfo.photographer.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#1877F2] transition-colors"
                                    aria-label="Facebook"
                                >
                                    <SimpleIcon icon={siFacebook} size={24} />
                                </a>
                            )}
                            {eventInfo.photographer.instagramUrl && (
                                <a
                                    href={eventInfo.photographer.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#E4405F] transition-colors"
                                    aria-label="Instagram"
                                >
                                    <SimpleIcon icon={siInstagram} size={24} />
                                </a>
                            )}
                            {eventInfo.photographer.twitterUrl && (
                                <a
                                    href={eventInfo.photographer.twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#000000] transition-colors"
                                    aria-label="Twitter/X"
                                >
                                    <SimpleIcon icon={siX} size={24} />
                                </a>
                            )}
                            {eventInfo.photographer.websiteUrl && (
                                <a
                                    href={eventInfo.photographer.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#5ea9dd] transition-colors"
                                    aria-label="Website"
                                >
                                    <Globe size={24} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Event Details */}
                    <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
                        <h1 className="text-2xl sm:text-3xl font-thai-bold text-gray-900 mb-2 leading-tight">
                            {eventInfo.event.title}
                        </h1>

                        {eventInfo.event.subtitle && (
                            <p className="text-gray-600 text-lg sm:text-xl font-thai-semibold mb-2">
                                {eventInfo.event.subtitle}
                                {eventInfo.event.eventDate && (
                                    <span className="md:before:content-['|'] md:before:mx-2 block md:inline text-gray-500 font-thai-regular text-base mt-1 md:mt-0">
                                        {new Date(eventInfo.event.eventDate).toLocaleDateString("th-TH", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                            </p>
                        )}

                        {/* Date line for mobile if not shown above or just extra emphasis if needed. 
                But per design request, it looks like subtitle | date is good. 
                Let's simplify and just put date below subtitle if needed or keep inline.
                Design image shows "The Glass House... | 24 Dec 2025"
            */}

                        {eventInfo.event.description && (
                            <p className="text-gray-600 font-thai-regular mt-4 max-w-lg leading-relaxed text-sm sm:text-base">
                                {eventInfo.event.description}
                            </p>
                        )}


                    </div>
                </div>
            </div>
        </header>
    );
}
