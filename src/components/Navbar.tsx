
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { MenuIcon, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? 
          "py-3 backdrop-blur-xl bg-black/70 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]" : 
          "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a 
          href="#" 
          className="flex items-center z-10"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="text-2xl font-display font-bold text-foreground">
            <span className="text-kifaa">K</span>ifaa
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#testimonials">Testimonials</NavLink>
          <button className="btn-secondary ml-4">Sign Up</button>
          <button className="btn-primary">Get Started</button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-10 p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <MenuIcon className="h-6 w-6 text-foreground" />
          )}
        </button>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "fixed inset-0 bg-background/95 backdrop-blur-xl transition-transform duration-300 flex flex-col justify-center items-center md:hidden",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col items-center space-y-8 text-xl">
            <MobileNavLink href="#features" onClick={() => setMobileMenuOpen(false)}>Features</MobileNavLink>
            <MobileNavLink href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</MobileNavLink>
            <MobileNavLink href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</MobileNavLink>
            <div className="pt-6 flex flex-col space-y-4">
              <button className="btn-secondary w-48">Sign Up</button>
              <button className="btn-primary w-48">Get Started</button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
    >
      {children}
      <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-kifaa transition-all duration-200 group-hover:w-full"></span>
    </a>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  return (
    <a 
      href={href} 
      className="font-medium text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent"
      onClick={onClick}
    >
      {children}
    </a>
  );
};

export default Navbar;
