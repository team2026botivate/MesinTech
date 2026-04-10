'use client';

import { useData } from '@/lib/data-context';
import { DispatchForm } from '@/components/dispatch-form';
import { Truck, MapPin, Phone, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function DispatchPage() {
  const { dispatches, isLoaded, transactions } = useData();

  if (!isLoaded) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading dispatch data...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'in_transit': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'returned': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 mr-1 inline" />;
      case 'in_transit': return <Navigation className="w-4 h-4 mr-1 inline" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 mr-1 inline" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dispatch</h1>
          <p className="text-sm text-muted-foreground">Manage ongoing and past shipments.</p>
        </div>
        <DispatchForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dispatches.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              No dispatches recorded yet. Click 'New Dispatch' to track an order.
            </CardContent>
          </Card>
        ) : (
          dispatches.map((dispatch) => {
            const sale = transactions.find((t) => t.id === dispatch.transactionId);
            return (
              <Card key={dispatch.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-base font-bold text-foreground leading-tight flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        {dispatch.dispatchNumber}
                      </CardTitle>
                      {sale && (
                        <p className="text-sm font-medium text-muted-foreground">
                          Invoice: {sale.invoiceNumber}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {dispatch.date ? format(new Date(dispatch.date), 'dd MMM yyyy') : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(dispatch.status)}>
                      {getStatusIcon(dispatch.status)}
                      <span className="capitalize">{(dispatch.status || 'pending').replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 border-t border-border/50">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Courier:</span>
                      <span className="font-medium text-foreground">{dispatch.dispatcherName}</span>
                    </div>
                    {dispatch.trackingNumber && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tracking No:</span>
                        <span className="font-medium text-foreground">{dispatch.trackingNumber}</span>
                      </div>
                    )}
                    {dispatch.vehicleNumber && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Vehicle No:</span>
                        <span className="font-medium text-foreground uppercase">{dispatch.vehicleNumber}</span>
                      </div>
                    )}
                  </div>

                  {(dispatch.driverName || dispatch.driverPhone) && (
                    <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                      {dispatch.driverName && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {dispatch.driverName} (Driver)
                        </div>
                      )}
                      {dispatch.driverPhone && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {dispatch.driverPhone}
                        </div>
                      )}
                    </div>
                  )}
                  {dispatch.notes && (
                    <p className="text-xs text-muted-foreground italic mt-3 bg-muted/50 p-2 rounded-md">
                      {dispatch.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
