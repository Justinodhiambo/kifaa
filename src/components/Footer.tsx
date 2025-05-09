
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
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
    <footer className="bg-secondary pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <a 
              href="#" 
              className="inline-block mb-6"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-primary">
                <span className="text-primary">K</span>ifaa
              </span>
            </a>
            <p className="text-muted-foreground mb-6">
              Unlocking financial potential with AI-driven credit & asset financing solutions.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </SocialLink>
              <SocialLink href="#" label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </SocialLink>
              <SocialLink href="#" label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </SocialLink>
            </div>
          </div>
          
          <div className="mt-2">
            <h4 className="font-display font-semibold text-lg mb-6">Product</h4>
            <nav className="flex flex-col space-y-5">
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors group flex items-center">
                Features
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors group flex items-center">
                Pricing
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link to="/integration" className="text-muted-foreground hover:text-foreground transition-colors group flex items-center">
                Integrations
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors group flex items-center">
                FAQ
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </nav>
          </div>
          
          <div className="mt-2">
            <h4 className="font-display font-semibold text-lg mb-6">Company</h4>
            <nav className="flex flex-col space-y-5">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/about#careers">Careers</FooterLink>
              <FooterLink to="/about#blog">Blog</FooterLink>
              <FooterLink to="/about#press">Press</FooterLink>
            </nav>
          </div>
          
          <div className="mt-2">
            <h4 className="font-display font-semibold text-lg mb-6">Legal</h4>
            <nav className="flex flex-col space-y-5">
              <FooterLink to="/legal#privacy">Privacy Policy</FooterLink>
              <FooterLink to="/legal#terms">Terms of Service</FooterLink>
              <FooterLink to="/legal#security">Security</FooterLink>
              <FooterLink to="/legal#compliance">Compliance</FooterLink>
            </nav>
          </div>
        </div>
        
        <div className="pt-8 border-t border-accent/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Kifaa. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
            <Link to="/legal#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, label, children }) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {children}
    </a>
  );
};

interface FooterLinkProps {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, onClick, children }) => {
  return (
    <Link
      to={to}
      className="text-muted-foreground hover:text-foreground transition-colors group flex items-center"
      onClick={onClick}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </Link>
  );
};

export default Footer;
