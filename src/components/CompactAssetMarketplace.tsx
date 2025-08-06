import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Filter } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  eligible: boolean;
  category: string;
}

const CompactAssetMarketplace = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('eligible');
  const [priceFilter, setPriceFilter] = useState<string>('low-to-high');

  const assets: Asset[] = [
    {
      id: '1',
      name: 'Motorcycle',
      description: 'Bajaj Boxer for boda boda business',
      icon: (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          🏍️
        </div>
      ),
      eligible: true,
      category: 'transport'
    },
    {
      id: '2',
      name: 'Water Tank',
      description: '500L capacity with stand',
      icon: (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          🪣
        </div>
      ),
      eligible: true,
      category: 'home'
    },
    {
      id: '3',
      name: 'Solar Panel',
      description: 'Home solar energy system',
      icon: (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          ☀️
        </div>
      ),
      eligible: false,
      category: 'energy'
    }
  ];

  const filteredAssets = assets.filter(asset => {
    if (categoryFilter === 'eligible') return asset.eligible;
    if (categoryFilter === 'all') return true;
    return asset.category === categoryFilter;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Browse Asset Financing Offers</CardTitle>
          <CardDescription>Assets you can finance through our partners</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eligible">Eligible Assets</SelectItem>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low-to-high">Price: Low to High</SelectItem>
                <SelectItem value="high-to-low">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="relative">
                {asset.eligible && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-green-100 text-green-800 text-xs">Eligible</Badge>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {asset.icon}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {asset.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        {asset.eligible ? 'Apply with partner' : 'Not eligible yet'}
                      </div>
                      <Button 
                        size="sm" 
                        variant={asset.eligible ? "default" : "secondary"}
                        disabled={!asset.eligible}
                        className="text-xs px-3 py-1 h-7"
                      >
                        {asset.eligible ? (
                          <>
                            Apply Now
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          'Not Available'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No assets available in this category</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactAssetMarketplace;