
import React, { useState } from 'react';
import FadeIn from './FadeIn';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const testimonials: Testimonial[] = [
    {
      quote: "Kifaa has completely transformed how I access financing for my business. The AI-based scoring helped me get better terms through their banking partners.",
      author: "Brian Kiptoo",
      role: "Small Business Owner",
      avatar: "BK",
      rating: 5
    },
    {
      quote: "As someone who was previously excluded from the financial system, Kifaa's USSD service has been life-changing. I can now access credit without a smartphone.",
      author: "Grace Achieng",
      role: "Entrepreneur",
      avatar: "GA",
      rating: 5
    },
    {
      quote: "The cross-border payment feature saved my import business thousands in fees. Transactions that used to take days now complete in minutes.",
      author: "Daniel Muriuki",
      role: "Import/Export Business",
      avatar: "DM",
      rating: 4
    },
    {
      quote: "Before Kifaa, I couldn't qualify for financing. Now banks offer me pre-approved loans based on my Kifaa score!",
      author: "Faith Chebet",
      role: "Self-employed Professional",
      avatar: "FC",
      rating: 5
    },
    {
      quote: "The wallet integration is seamless. I can receive money via M-Pesa and use it to pay my installments automatically.",
      author: "Kevin Otieno",
      role: "Ride-sharing Driver",
      avatar: "KO",
      rating: 4
    },
    {
      quote: "My business grew by 30% after I accessed affordable inventory financing through Kifaa's platform. Their banking partners offered terms I couldn't get elsewhere.",
      author: "Jane Nyambura",
      role: "Retail Shop Owner",
      avatar: "JN",
      rating: 5
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className={cn(
      "section relative py-20",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1.5">Testimonials</Badge>
          <h2 className={cn(
            "mb-4",
            isDark ? "text-white" : "text-gray-900"
          )}>What Our Users Say</h2>
          <p className={cn(
            "text-lg max-w-2xl mx-auto",
            isDark ? "text-gray-300" : "text-muted-foreground"
          )}>
            Join thousands who have already transformed their financial future with Kifaa.
          </p>
        </FadeIn>

        <div className={cn(
          "relative max-w-4xl mx-auto p-8 md:p-12 rounded-xl shadow-sm border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        )}>
          <div className={cn(
            "absolute -top-4 left-8 opacity-30",
            isDark ? "text-primary-400" : "text-primary"
          )}>
            <Quote size={80} className="rotate-180" />
          </div>
          
          <div className="mb-10 md:mb-8 relative">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={cn(
                  "transition-all duration-500 ease-in-out absolute top-0 left-0 w-full",
                  activeIndex === index 
                    ? "opacity-100 translate-x-0 z-10" 
                    : index < activeIndex 
                      ? "opacity-0 -translate-x-full z-0" 
                      : "opacity-0 translate-x-full z-0"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-8">
                    <div className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold",
                      isDark ? "bg-primary-800/30 text-primary-400" : "bg-primary/10 text-primary"
                    )}>
                      {testimonial.avatar}
                    </div>
                  </div>
                  
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < testimonial.rating 
                            ? isDark ? "text-primary-400 fill-primary-400" : "text-primary fill-primary"
                            : isDark ? "text-gray-600" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  
                  <blockquote className={cn(
                    "text-xl md:text-2xl font-display mb-6 relative z-10",
                    isDark ? "text-white" : "text-gray-800"
                  )}>
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div>
                    <p className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-gray-800"
                    )}>{testimonial.author}</p>
                    <p className={cn(
                      isDark ? "text-gray-400" : "text-muted-foreground"
                    )}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Placeholder for the height to prevent layout shift */}
            <div className="opacity-0 pointer-events-none">
              <div className="flex flex-col items-center text-center">
                <div className="mb-8">
                  <div className="h-16 w-16 rounded-full"></div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-display italic mb-6">
                  "{testimonials[activeIndex].quote}"
                </blockquote>
                <div>
                  <p className="font-semibold">{testimonials[activeIndex].author}</p>
                  <p className="text-muted-foreground">{testimonials[activeIndex].role}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={prevTestimonial}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border transition-colors",
                isDark 
                  ? "border-gray-700 hover:bg-gray-700 text-gray-300" 
                  : "border-border hover:bg-accent"
              )}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    activeIndex === index 
                      ? isDark 
                        ? "w-8 bg-primary-400" 
                        : "w-8 bg-primary"
                      : isDark 
                        ? "w-2.5 bg-gray-600" 
                        : "w-2.5 bg-muted-foreground/30"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextTestimonial}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border transition-colors",
                isDark 
                  ? "border-gray-700 hover:bg-gray-700 text-gray-300" 
                  : "border-border hover:bg-accent"
              )}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
