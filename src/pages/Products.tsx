
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Personal Loan",
      description: "Quick access to funds for personal expenses with flexible repayment options.",
      minAmount: 5000,
      maxAmount: 500000,
      interestRate: "12%",
      term: "1-36 months",
      requirements: ["Valid ID", "Proof of income", "6 months bank statements"],
      tag: "popular"
    },
    {
      id: 2,
      name: "Business Loan",
      description: "Finance your business growth with competitive rates and tailored repayment schedules.",
      minAmount: 50000,
      maxAmount: 5000000,
      interestRate: "14%",
      term: "3-60 months",
      requirements: ["Business registration", "2 years financial statements", "Business plan"],
      tag: ""
    },
    {
      id: 3,
      name: "Asset Financing",
      description: "Purchase equipment, vehicles, or other assets with structured financing solutions.",
      minAmount: 100000,
      maxAmount: 10000000,
      interestRate: "15%",
      term: "12-84 months",
      requirements: ["Asset quotation", "Proof of income", "30% down payment"],
      tag: "new"
    },
    {
      id: 4,
      name: "Emergency Loan",
      description: "Immediate funding for urgent financial needs with quick approval process.",
      minAmount: 1000,
      maxAmount: 50000,
      interestRate: "18%",
      term: "1-12 months",
      requirements: ["Valid ID", "Active account for 3+ months"],
      tag: ""
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Products</h1>
      <p className="text-gray-500 mb-8">Explore our financial products tailored to meet your needs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{product.name}</CardTitle>
                {product.tag && (
                  <Badge variant={product.tag === "popular" ? "default" : "secondary"}>
                    {product.tag === "popular" ? "Popular" : "New"}
                  </Badge>
                )}
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount Range:</span>
                  <span className="font-medium">KES {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Interest Rate:</span>
                  <span className="font-medium">{product.interestRate} p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Term:</span>
                  <span className="font-medium">{product.term}</span>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {product.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Products;
