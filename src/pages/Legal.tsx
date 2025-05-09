
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
              <Tabs defaultValue="privacy" id="privacy">
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
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Collection and Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          We collect information to provide and improve our services. The types of information we collect depend on how you use our platform:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Account information (name, email, phone number)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Transaction data (for credit scoring purposes)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Device and usage information</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Information from third-party integrations (with your permission)</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Protection Measures</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          Kifaa implements multiple layers of data protection:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Data encryption in transit and at rest</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Secure access controls and authentication</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Regular security audits and penetration testing</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Employee training on data protection</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Data minimization practices</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Rights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          You have the right to:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Access your personal data</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Correct inaccurate information</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Delete your data (with certain limitations)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Withdraw consent for data processing</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Lodge complaints with regulatory authorities</span>
                          </li>
                        </ul>
                        <div className="mt-6 text-center">
                          <a href="https://kifaa.com/privacy-policy" className="text-primary underline">
                            View Complete Privacy Policy
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                </TabsContent>
                
                <TabsContent value="terms" className="bg-card rounded-lg border p-6" id="terms">
                  <FadeIn>
                    <div className="flex items-center mb-6">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Terms of Service</h2>
                    </div>
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Platform Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          Users agree to:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Provide accurate and complete information</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Maintain the security of account credentials</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Use the platform for lawful purposes only</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Not attempt to reverse-engineer the service</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Comply with all applicable laws and regulations</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Service Limitations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          Kifaa reserves the right to:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Modify, suspend, or discontinue services</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Update terms with reasonable notice</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Remove content that violates our policies</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Terminate accounts for policy violations</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <div className="p-6 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold mb-2">Disclaimers and Limitations</h3>
                      <p className="text-muted-foreground mb-4">
                        The platform is provided "as is" without warranties of any kind. Kifaa shall not be liable for indirect, incidental, or consequential damages arising from platform use.
                      </p>
                      <div className="text-center">
                        <a href="https://kifaa.com/terms" className="text-primary underline">
                          View Complete Terms of Service
                        </a>
                      </div>
                    </div>
                  </FadeIn>
                </TabsContent>
                
                <TabsContent value="compliance" className="bg-card rounded-lg border p-6" id="compliance">
                  <FadeIn>
                    <div className="flex items-center mb-6">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Compliance</h2>
                    </div>
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Regulatory Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          Our platform complies with:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Kenya's Data Protection Act</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>GDPR for applicable users</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>CBK fintech sandbox requirements</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Anti-Money Laundering (AML) regulations</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Know Your Customer (KYC) requirements</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Security Implementations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          Kifaa implements industry best practices for security:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>AES-256 encryption for data storage</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>TLS protocols for data transmission</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Multi-factor authentication</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Regular security audits and penetration testing</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Secure development practices</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Certifications and Partnerships</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">
                          Kifaa maintains certifications and partnerships that demonstrate our commitment to compliance:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Central Bank of Kenya Fintech Sandbox participant</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>ISO 27001 certification (in progress)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>Partnership with licensed financial institutions</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </FadeIn>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* General Legal Info */}
        <section className="py-12 bg-muted/50" id="security">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold">Legal Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Kifaa complies with local and international laws, including:
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>The Kenya Data Protection Act</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>The General Data Protection Regulation (GDPR)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Applicable AML/KYC standards</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Central Bank of Kenya's fintech sandbox rules</span>
                      </li>
                    </ul>
                    <p>
                      All users and partners must accept our terms before using the platform. API usage is governed by specific licensing terms.
                    </p>
                  </CardContent>
                </Card>
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
