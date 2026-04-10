'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { CompanyForm } from '@/components/company-form';
import { AgeingConfigForm } from '@/components/ageing-config-form';
import { Mail, Phone, Settings, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CompaniesPage() {
  const { companies, isLoaded } = useData();

  if (!isLoaded) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading directory...</p>
      </div>
    );
  }

  const customers = companies.filter((c) => c.type === 'customer');
  const suppliers = companies.filter((c) => c.type === 'supplier');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground">Manage your list of customers and suppliers.</p>
        </div>
        <CompanyForm />
      </div>

      <div className="space-y-12">
        {/* Customers Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Customers ({customers.length})</h2>
          </div>
          
          {customers.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No customer records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((company) => (
                <Card key={company.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {company.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0">
                          {company.paymentTermsDays} Day Terms
                        </Badge>
                      </div>
                      <AgeingConfigForm company={company} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.email && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${company.email}`} className="hover:text-foreground hover:underline truncate">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${company.phone}`} className="hover:text-foreground hover:underline">
                          {company.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Suppliers Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">Suppliers ({suppliers.length})</h2>
          </div>

          {suppliers.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No supplier records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((company) => (
                <Card key={company.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-foreground leading-tight group-hover:text-secondary transition-colors">
                          {company.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0">
                          {company.paymentTermsDays} Day Terms
                        </Badge>
                      </div>
                      <AgeingConfigForm company={company} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.email && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${company.email}`} className="hover:text-foreground hover:underline truncate">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${company.phone}`} className="hover:text-foreground hover:underline">
                          {company.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
