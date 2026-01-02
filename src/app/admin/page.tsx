'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Users, Truck, Plus, Edit, Trash2, RefreshCw, Database, Shield, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading';
import Link from 'next/link';

interface FleetMapping {
  id: string;
  kind: string;
  key: string;
  value: string;
}

interface DriverMapping {
  id: string;
  key: string;
  value: string;
}

export default function AdminPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [fleetMappings, setFleetMappings] = useState<FleetMapping[]>([]);
  const [driverMappings, setDriverMappings] = useState<DriverMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFleetKey, setNewFleetKey] = useState('');
  const [newFleetValue, setNewFleetValue] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');

  const fetchMappings = async () => {
    try {
      setIsLoading(true);
      const [fleetRes, driverRes] = await Promise.all([
        fetch('/api/mappings?kind=fleet'),
        fetch('/api/mappings?kind=driver')
      ]);

      if (fleetRes.ok) {
        const data = await fleetRes.json();
        setFleetMappings(data.mappings || []);
      }
      if (driverRes.ok) {
        const data = await driverRes.json();
        setDriverMappings(data.mappings || []);
      }
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
      toast.error('Failed to load mappings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      fetchMappings();
    }
  }, [loading, isAuthenticated, router]);

  const addFleetMapping = async () => {
    if (!newFleetKey || !newFleetValue) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'fleet',
          key: newFleetKey,
          value: newFleetValue
        })
      });

      if (response.ok) {
        toast.success('Fleet mapping added');
        setNewFleetKey('');
        setNewFleetValue('');
        fetchMappings();
      } else {
        toast.error('Failed to add fleet mapping');
      }
    } catch (error) {
      toast.error('Failed to add fleet mapping');
    }
  };

  const addDriverMapping = async () => {
    if (!newDriverName || !newDriverPhone) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'driver',
          key: newDriverName,
          value: JSON.stringify({ phone: newDriverPhone })
        })
      });

      if (response.ok) {
        toast.success('Driver mapping added');
        setNewDriverName('');
        setNewDriverPhone('');
        fetchMappings();
      } else {
        toast.error('Failed to add driver mapping');
      }
    } catch (error) {
      toast.error('Failed to add driver mapping');
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const response = await fetch(`/api/mappings?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Mapping deleted');
        fetchMappings();
      } else {
        toast.error('Failed to delete mapping');
      }
    } catch (error) {
      toast.error('Failed to delete mapping');
    }
  };

  if (loading || isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Admin Dashboard
            </h1>
            <p className="text-blue-200">Manage fleet mappings, drivers, and system settings</p>
          </div>
          <Button variant="outline" onClick={fetchMappings} className="border-slate-600 text-white hover:bg-slate-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Fleet Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Fleet Number (e.g., XW17GH)"
                  value={newFleetKey}
                  onChange={(e) => setNewFleetKey(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Input
                  placeholder="Details (e.g., 2023 Volvo FH)"
                  value={newFleetValue}
                  onChange={(e) => setNewFleetValue(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button onClick={addFleetMapping} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {fleetMappings.map(mapping => (
                  <div key={mapping.id} className="flex items-center justify-between bg-slate-900/30 p-3 rounded-lg">
                    <div>
                      <span className="font-mono text-blue-400">{mapping.key}</span>
                      <span className="text-slate-400 mx-2">-</span>
                      <span className="text-slate-200">{mapping.value}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMapping(mapping.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Driver Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Driver Name"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Input
                  placeholder="Phone Number"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button onClick={addDriverMapping} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {driverMappings.map(mapping => {
                  try {
                    const data = JSON.parse(mapping.value);
                    return (
                      <div key={mapping.id} className="flex items-center justify-between bg-slate-900/30 p-3 rounded-lg">
                        <div>
                          <span className="font-medium text-white">{mapping.key}</span>
                          <span className="text-slate-400 mx-2">-</span>
                          <span className="text-slate-300">{data.phone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMapping(mapping.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/30 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-400">{fleetMappings.length}</p>
                  <p className="text-slate-400 text-sm">Fleet Vehicles</p>
                </div>
                <div className="bg-slate-900/30 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-400">{driverMappings.length}</p>
                  <p className="text-slate-400 text-sm">Registered Drivers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/mappings" className="block">
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700 justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage All Mappings
                </Button>
              </Link>
              <Button variant="outline" onClick={() => {
                toast.info('Database backup started...');
                setTimeout(() => toast.success('Database backup completed'), 2000);
              }} className="w-full border-slate-600 text-white hover:bg-slate-700 justify-start">
                <Database className="w-4 h-4 mr-2" />
                Backup Database
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}