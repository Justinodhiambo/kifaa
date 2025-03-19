
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuIcon, X, ChevronRight, Hexagon, Zap } from "lucide-react";
import { useTheme } from './ThemeProvider';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Close mobile menu if open
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      
      // Calculate header height for offset
      const headerHeight = 80; // Approximate navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? 
          theme === "dark" ? 
            "py-3 backdrop-blur-xl bg-gray-900/90 border-b border-gray-800/30 shadow-sm" : 
            "py-3 backdrop-blur-xl bg-white/90 border-b border-gray-200/30 shadow-sm"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a 
          href="#" 
          className="flex items-center z-10"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="flex items-center">
            <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center mr-2 shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-primary opacity-80"></div>
              <div className="relative z-10 flex items-center justify-center">
                <Hexagon className="h-6 w-6 text-white" strokeWidth={1.5} />
                <Zap className="h-4 w-4 text-white absolute" strokeWidth={2.5} />
              </div>
            </div>
            <span className={cn(
              "text-2xl font-display font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              Kifaa
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#features" onClick={() => scrollToSection('features')}>Features</NavLink>
          <NavLink href="#how-it-works" onClick={() => scrollToSection('how-it-works')}>How It Works</NavLink>
          <NavLink href="#testimonials" onClick={() => scrollToSection('testimonials')}>Testimonials</NavLink>
          <Button variant="ghost" className={cn(
            "ml-4",
            theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
          )}>Sign In</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">Get Started</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-10 p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className={cn("h-6 w-6", theme === "dark" ? "text-white" : "text-gray-900")} />
          ) : (
            <MenuIcon className={cn("h-6 w-6", theme === "dark" ? "text-white" : "text-gray-900")} />
          )}
        </button>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "fixed inset-0 backdrop-blur-xl transition-transform duration-300 flex flex-col justify-center items-center md:hidden",
            theme === "dark" ? "bg-gray-900/98" : "bg-white/98",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col items-center space-y-8 text-xl">
            <MobileNavLink 
              href="#features" 
              onClick={() => scrollToSection('features')}
            >
              Features
            </MobileNavLink>
            <MobileNavLink 
              href="#how-it-works" 
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
            </MobileNavLink>
            <MobileNavLink 
              href="#testimonials" 
              onClick={() => scrollToSection('testimonials')}
            >
              Testimonials
            </MobileNavLink>
            <div className="pt-6 flex flex-col space-y-4">
              <Button variant="outline" className="w-48">Sign In</Button>
              <Button className="w-48">Get Started</Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <a 
      href={href} 
      className={cn(
        "font-medium transition-colors duration-200 relative group",
        theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
      )}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
    >
      {children}
      <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-primary transition-all duration-200 group-hover:w-full"></span>
    </a>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <a 
      href={href} 
      className={cn(
        "font-medium transition-colors duration-200 px-4 py-2 rounded-lg flex items-center",
        theme === "dark" ? 
          "text-gray-300 hover:bg-gray-800/70" : 
          "text-gray-900 hover:bg-gray-100"
      )}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
    >
      {children}
      <ChevronRight className="ml-1 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </a>
  );
};

export default Navbar;
