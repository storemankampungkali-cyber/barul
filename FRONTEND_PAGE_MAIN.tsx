'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { BarangMasukForm } from './FRONTEND_BARANG_MASUK';
import { BarangKeluarForm } from './FRONTEND_BARANG_KELUAR';
import { StockOpnameForm } from './FRONTEND_STOCK_OPNAME';
import { SupplierManagement } from './FRONTEND_SUPPLIER_MANAGEMENT';
import { AdminPanel } from './FRONTEND_ADMIN_PANEL';
import { AlertCircle, Box, LogOut, BarChart3, ArrowLeftRight, FileText, Package, Settings } from 'lucide-react';

// Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'barang-masuk' | 'barang-keluar' | 'stock-opname' | 'suppliers' | 'admin'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const { getGasApiClient } = await import('./FRONTEND_GAS_API');
      const api = getGasApiClient();
      const result = await api.getDashboardStats();
      if (result.success) {
        setStats(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal memuat data dashboard'
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat memuat data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Berhasil',
      description: 'Logout berhasil'
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Cube Animation Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground rounded-lg transform rotate-45" />
          </div>
          <div className="absolute inset-4 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground to-primary rounded-lg transform rotate-12" />
          </div>
          <div className="absolute inset-8 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground rounded-lg transform -rotate-30" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Sistem Inventory</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{user?.name}</span> ({user?.role})
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 hidden md:block">
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'barang-masuk' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('barang-masuk')}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Barang Masuk
              </Button>
              <Button
                variant={activeTab === 'barang-keluar' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('barang-keluar')}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Barang Keluar
              </Button>
              <Button
                variant={activeTab === 'stock-opname' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('stock-opname')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Stock Opname
              </Button>
              <Button
                variant={activeTab === 'suppliers' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('suppliers')}
              >
                <Package className="h-4 w-4 mr-2" />
                Suppliers
              </Button>
              {user?.role === 'ADMIN' && (
                <Button
                  variant={activeTab === 'admin' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('admin')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </nav>
          </aside>

          {/* Mobile Navigation */}
          <div className="md:hidden p-2 border-b space-x-2 overflow-x-auto">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
            </Button>
            <Button
              variant={activeTab === 'barang-masuk' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('barang-masuk')}
            >
              Masuk
            </Button>
            <Button
              variant={activeTab === 'barang-keluar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('barang-keluar')}
            >
              Keluar
            </Button>
            <Button
              variant={activeTab === 'stock-opname' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('stock-opname')}
            >
              Stock Opname
            </Button>
            <Button
              variant={activeTab === 'suppliers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('suppliers')}
            >
              <Package className="h-4 w-4 mr-1" />
            </Button>
            {user?.role === 'ADMIN' && (
              <Button
                variant={activeTab === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('admin')}
              >
                <Settings className="h-4 w-4 mr-1" />
              </Button>
            )}
          </div>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Dashboard</h2>
                  <p className="text-muted-foreground">Statistik real-time inventory</p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Memuat data...</div>
                  </div>
                ) : stats && (
                  <>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.totalBarang}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
                          <Box className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.totalStok}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-destructive">{stats.stokMenipis}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
                          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            Masuk: {stats.transaksiMasukHariIni}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Keluar: {stats.transaksiKeluarHariIni}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top 3 Barang Keluar */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top 3 Barang Paling Banyak Keluar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {stats.topBarangKeluar?.map((item: any, index: number) => (
                            <div key={item.barangId} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium">{item.barangNama}</div>
                                  <div className="text-sm text-muted-foreground">{item.count} transaksi</div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!stats.topBarangKeluar || stats.topBarangKeluar.length === 0) && (
                            <div className="text-sm text-muted-foreground">Belum ada data transaksi</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stok Menipis List */}
                    {stats.stokMenipisList && stats.stokMenipisList.length > 0 && (
                      <Card className="border-destructive">
                        <CardHeader>
                          <CardTitle className="text-destructive">Barang dengan Stok Menipis</CardTitle>
                          <CardDescription>
                            Perhatikan barang-barang berikut dan lakukan replenishment segera
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {stats.stokMenipisList.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                                <div>
                                  <div className="font-medium">{item.nama}</div>
                                  <div className="text-sm text-muted-foreground">Kode: {item.kode}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-destructive">{item.stok} {item.satuan}</div>
                                  <div className="text-sm text-muted-foreground">Min: {item.minStok} {item.satuan}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'barang-masuk' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Barang Masuk</h2>
                  <p className="text-muted-foreground">Catat barang masuk ke inventory</p>
                </div>
                <BarangMasukForm onSuccess={() => setActiveTab('dashboard')} />
              </div>
            )}

            {activeTab === 'barang-keluar' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Barang Keluar</h2>
                  <p className="text-muted-foreground">Catat barang keluar dari inventory</p>
                </div>
                <BarangKeluarForm onSuccess={() => setActiveTab('dashboard')} />
              </div>
            )}

            {activeTab === 'stock-opname' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Stock Opname</h2>
                  <p className="text-muted-foreground">Catat stok fisik dan hitung selisih</p>
                </div>
                <StockOpnameForm onSuccess={() => setActiveTab('dashboard')} />
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Supplier Management</h2>
                  <p className="text-muted-foreground">Kelola data supplier</p>
                </div>
                <SupplierManagement />
              </div>
            )}

            {activeTab === 'admin' && user?.role === 'ADMIN' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Admin Panel</h2>
                  <p className="text-muted-foreground">Manajemen user, barang, dan activity log</p>
                </div>
                <AdminPanel />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Login Component
function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        toast({
          title: 'Berhasil',
          description: result.message
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: result.message
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat login'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* 3D Cube Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground rounded-lg transform rotate-45" />
          </div>
          <div className="absolute inset-4 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground to-primary rounded-lg transform rotate-12" />
          </div>
          <div className="absolute inset-8 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground rounded-lg transform -rotate-30" />
          </div>
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sistem Inventory</CardTitle>
          <CardDescription className="text-center">
            Login untuk mengakses sistem inventory management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Page Component
export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
