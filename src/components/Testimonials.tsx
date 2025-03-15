
import React, { useState } from 'react';
import FadeIn from './FadeIn';
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "Kifaa has completely transformed how I access financing for my business. The AI-based scoring gave me better terms than any traditional bank.",
      author: "Sarah Johnson",
      role: "Small Business Owner",
      avatar: "SJ",
      rating: 5
    },
    {
      quote: "As someone who was previously excluded from the financial system, Kifaa's USSD service has been life-changing. I can now access credit without a smartphone.",
      author: "David Maina",
      role: "Entrepreneur",
      avatar: "DM",
      rating: 5
    },
    {
      quote: "The cross-border payment feature saved my import business thousands in fees. Transactions that used to take days now complete in minutes.",
      author: "Michael Chen",
      role: "Import/Export Business",
      avatar: "MC",
      rating: 4
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
    <section id="testimonials" className="section relative">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands who have already transformed their financial future with Kifaa.
          </p>
        </FadeIn>

        <div className="relative max-w-4xl mx-auto glass-card p-8 md:p-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-6 -left-6 h-12 w-12 rounded-full bg-kifaa-50"></div>
            <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-kifaa-50"></div>
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
                    <div className="h-16 w-16 rounded-full bg-kifaa-50 text-kifaa-800 flex items-center justify-center text-xl font-bold">
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
                            ? "text-kifaa fill-kifaa" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl font-display italic mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
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
              className="h-10 w-10 rounded-full flex items-center justify-center border border-border hover:bg-accent transition-colors"
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
                      ? "w-8 bg-kifaa" 
                      : "w-2.5 bg-gray-300"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextTestimonial}
              className="h-10 w-10 rounded-full flex items-center justify-center border border-border hover:bg-accent transition-colors"
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
