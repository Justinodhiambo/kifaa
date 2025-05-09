
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Shield, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Legal = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 md:pt-24 md:pb-16">
          <AnimatedGradient subtle={true} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-block py-1.5 px-4 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary border-primary/20 border">
                <span className="flex items-center">
                  <FileText className="mr-1.5 h-4 w-4" /> 
                  Legal
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Legal Information</h1>
              <p className="text-lg text-muted-foreground">
                Our commitment to compliance, security, and user privacy
              </p>
            </div>
          </div>
        </section>
        
        {/* Legal Tabs */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="privacy">
                <div className="flex justify-center mb-8">
                  <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                    <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="privacy" className="bg-card rounded-lg border p-6">
                  <FadeIn>
                    <div className="flex items-center mb-6">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Privacy Policy</h2>
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-foreground">
                      <p>
                        Kifaa is committed to protecting your data. We do not sell personal information to third parties. All user data is encrypted, and access is limited to authorized systems.
                      </p>
                      
                      <h3>Data Collection and Usage</h3>
                      <p>
                        We collect information to provide and improve our services. The types of information we collect depend on how you use our platform:
                      </p>
                      <ul>
                        <li>Account information (name, email, phone number)</li>
                        <li>Transaction data (for credit scoring purposes)</li>
                        <li>Device and usage information</li>
                        <li>Information from third-party integrations (with your permission)</li>
                      </ul>
                      
                      <h3>Data Protection Measures</h3>
                      <p>
                        Kifaa implements multiple layers of data protection:
                      </p>
                      <ul>
                        <li>Data encryption in transit and at rest</li>
                        <li>Secure access controls and authentication</li>
                        <li>Regular security audits and penetration testing</li>
                        <li>Employee training on data protection</li>
                        <li>Data minimization practices</li>
                      </ul>
                      
                      <h3>Your Rights</h3>
                      <p>
                        You have the right to:
                      </p>
                      <ul>
                        <li>Access your personal data</li>
                        <li>Correct inaccurate information</li>
                        <li>Delete your data (with certain limitations)</li>
                        <li>Withdraw consent for data processing</li>
                        <li>Lodge complaints with regulatory authorities</li>
                      </ul>
                      
                      <p>
                        For the complete privacy policy, please visit <a href="https://kifaa.com/privacy-policy" className="text-primary underline">kifaa.com/privacy-policy</a>.
                      </p>
                    </div>
                  </FadeIn>
                </TabsContent>
                
                <TabsContent value="terms" className="bg-card rounded-lg border p-6">
                  <FadeIn>
                    <div className="flex items-center mb-6">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Terms of Service</h2>
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-foreground">
                      <p>
                        By using Kifaa, you agree to our Terms of Service, which outline usage policies, liability limitations, and user obligations.
                      </p>
                      
                      <h3>Platform Usage</h3>
                      <p>
                        Users agree to:
                      </p>
                      <ul>
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of account credentials</li>
                        <li>Use the platform for lawful purposes only</li>
                        <li>Not attempt to reverse-engineer the service</li>
                        <li>Comply with all applicable laws and regulations</li>
                      </ul>
                      
                      <h3>Service Limitations</h3>
                      <p>
                        Kifaa reserves the right to:
                      </p>
                      <ul>
                        <li>Modify, suspend, or discontinue services</li>
                        <li>Update terms with reasonable notice</li>
                        <li>Remove content that violates our policies</li>
                        <li>Terminate accounts for policy violations</li>
                      </ul>
                      
                      <h3>Disclaimers and Limitations</h3>
                      <p>
                        The platform is provided "as is" without warranties of any kind. Kifaa shall not be liable for indirect, incidental, or consequential damages arising from platform use.
                      </p>
                      
                      <p>
                        For the complete terms of service, please visit <a href="https://kifaa.com/terms" className="text-primary underline">kifaa.com/terms</a>.
                      </p>
                    </div>
                  </FadeIn>
                </TabsContent>
                
                <TabsContent value="compliance" className="bg-card rounded-lg border p-6">
                  <FadeIn>
                    <div className="flex items-center mb-6">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Compliance</h2>
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-foreground">
                      <p>
                        Kifaa is fully compliant with relevant financial and data protection regulations.
                      </p>
                      
                      <h3>Regulatory Compliance</h3>
                      <p>
                        Our platform complies with:
                      </p>
                      <ul>
                        <li>Kenya's Data Protection Act</li>
                        <li>GDPR for applicable users</li>
                        <li>CBK fintech sandbox requirements</li>
                        <li>Anti-Money Laundering (AML) regulations</li>
                        <li>Know Your Customer (KYC) requirements</li>
                      </ul>
                      
                      <h3>Security Implementations</h3>
                      <p>
                        Kifaa implements industry best practices for security:
                      </p>
                      <ul>
                        <li>AES-256 encryption for data storage</li>
                        <li>TLS protocols for data transmission</li>
                        <li>Multi-factor authentication</li>
                        <li>Regular security audits and penetration testing</li>
                        <li>Secure development practices</li>
                      </ul>
                      
                      <h3>Certifications and Partnerships</h3>
                      <p>
                        Kifaa maintains certifications and partnerships that demonstrate our commitment to compliance:
                      </p>
                      <ul>
                        <li>Central Bank of Kenya Fintech Sandbox participant</li>
                        <li>ISO 27001 certification (in progress)</li>
                        <li>Partnership with licensed financial institutions</li>
                      </ul>
                    </div>
                  </FadeIn>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* General Legal Info */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Legal Summary</h2>
                <div className="prose prose-lg max-w-none text-foreground">
                  <p>
                    Kifaa complies with local and international laws, including:
                  </p>
                  <ul>
                    <li>The Kenya Data Protection Act</li>
                    <li>The General Data Protection Regulation (GDPR)</li>
                    <li>Applicable AML/KYC standards</li>
                    <li>Central Bank of Kenya's fintech sandbox rules</li>
                  </ul>
                  <p>
                    All users and partners must accept our terms before using the platform. API usage is governed by specific licensing terms.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Legal;
