import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Filter, MapPin, Star } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyPayment: number;
  category: string;
  partner: string;
  eligible: boolean;
  popularity: number;
  region: string;
  imageUrl: string;
}

const AssetMarketplace = () => {
  const [sortBy, setSortBy] = useState<'price' | 'popularity' | 'eligibility'>('popularity');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const assets: Asset[] = [
    {
      id: '1',
      name: 'Bajaj Boxer 150cc Motorcycle',
      description: 'Reliable motorcycle for boda boda business',
      price: 185000,
      monthlyPayment: 8500,
      category: 'Transport',
      partner: 'ABC SACCO',
      eligible: true,
      popularity: 95,
      region: 'Nairobi',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      name: '500L Water Tank',
      description: 'Plastic water storage tank with stand',
      price: 12500,
      monthlyPayment: 650,
      category: 'Home',
      partner: 'Clean Water Finance',
      eligible: true,
      popularity: 78,
      region: 'Nakuru',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Energy Efficient Cookstove',
      description: 'Improved cookstove for reduced charcoal use',
      price: 4500,
      monthlyPayment: 350,
      category: 'Home',
      partner: 'Green Energy Co-op',
      eligible: false,
      popularity: 65,
      region: 'Kisumu',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '4',
      name: 'Commercial Refrigerator',
      description: '400L commercial fridge for small business',
      price: 95000,
      monthlyPayment: 4800,
      category: 'Business',
      partner: 'Business Growth SACCO',
      eligible: true,
      popularity: 82,
      region: 'Mombasa',
      imageUrl: '/placeholder.svg'
    }
  ];

  const sortedAssets = [...assets].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'popularity':
        return b.popularity - a.popularity;
      case 'eligibility':
        return b.eligible === a.eligible ? 0 : b.eligible ? 1 : -1;
      default:
        return 0;
    }
  });

  const filteredAssets = categoryFilter === 'all' 
    ? sortedAssets 
    : sortedAssets.filter(asset => asset.category.toLowerCase() === categoryFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Marketplace</h2>
          <p className="text-muted-foreground">Discover assets you can finance through our partners</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="eligibility">Eligibility</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className={`relative ${!asset.eligible ? 'opacity-60' : ''}`}>
            {asset.eligible && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-green-100 text-green-800">Eligible</Badge>
              </div>
            )}
            
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
              <div className="text-gray-400 text-sm">Asset Image</div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{asset.name}</CardTitle>
                  <CardDescription className="mt-1">{asset.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Price</span>
                  <span className="font-semibold">{formatCurrency(asset.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Payment</span>
                  <span className="font-semibold text-primary">{formatCurrency(asset.monthlyPayment)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Partner</span>
                  <span className="font-medium">{asset.partner}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Region</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{asset.region}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Popularity</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{asset.popularity}%</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                disabled={!asset.eligible}
                variant={asset.eligible ? "default" : "secondary"}
              >
                {asset.eligible ? (
                  <>
                    Apply via {asset.partner}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'Not Eligible'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetMarketplace;