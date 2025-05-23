
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import LaptopFrame from '@/components/LaptopFrame';

const AdminDashboard = () => {
  const [laptopVariant, setLaptopVariant] = useState<'macbook' | 'windows'>('macbook');

  const toggleLaptopVariant = () => {
    setLaptopVariant(prev => prev === 'macbook' ? 'windows' : 'macbook');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={toggleLaptopVariant} 
          className="px-4 py-2 rounded-md bg-primary text-white text-sm"
        >
          Switch to {laptopVariant === 'macbook' ? 'Windows' : 'MacBook'} Style
        </button>
      </div>
      
      <LaptopFrame variant={laptopVariant}>
        <div className="p-4 overflow-auto max-h-[calc(100vh-220px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">
                  +0% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Loans</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">
                  +0% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Disbursed</CardDescription>
                <CardTitle className="text-3xl">KES 0</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">
                  +0% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Repayment Rate</CardDescription>
                <CardTitle className="text-3xl">0%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">
                  +0% from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="users" className="mb-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>View and manage system users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500 italic">
                    No users found
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="loans" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Applications</CardTitle>
                  <CardDescription>Review and process loan applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500 italic">
                    No pending loan applications
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View all system transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500 italic">
                    No transactions found
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage financial products and offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500 italic">
                    No products found
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>CPU Usage</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Memory Usage</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Storage Usage</span>
                      <span>15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Network Traffic</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities and logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-gray-500 italic">
                  No recent activities
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </LaptopFrame>
    </div>
  );
};

export default AdminDashboard;
