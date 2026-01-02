'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getGasApiClient } from '@/lib/gas-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Search, Plus, Edit, Trash2, Users, Package, Settings, CheckCircle, FileText, Phone, Mail, MapPin } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface Barang {
  id: string;
  kode: string;
  nama: string;
  satuanDefault: string;
  satuanAlternatif1: string;
  konversiAlternatif1: number;
  satuanAlternatif2: string;
  konversiAlternatif2: number;
  minStok: number;
  kategori: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// User Management Component
function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'STAFF'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.getUsers();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data user'
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'STAFF'
    });
    setEditingUser(null);
    setShowForm(true);
  };

  const openEditForm = (user: User) => {
    setFormData({
      username: user.username,
      name: user.name,
      password: '',
      role: user.role
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Username dan nama wajib diisi'
      });
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();

      let result;
      if (editingUser) {
        result = await api.updateUser(editingUser.id, formData);
      } else {
        result = await api.createUser(formData);
      }

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: editingUser ? 'User berhasil diupdate' : 'User berhasil ditambahkan'
        });
        closeForm();
        loadUsers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menyimpan user'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan user'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.deleteUser(userId);

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'User berhasil dihapus'
        });
        loadUsers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menghapus user'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus user'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Manajemen User
        </CardTitle>
        <CardDescription>Tambah, edit, dan hapus user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search & Add Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openAddForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          </div>

          {/* User Form */}
          {showForm && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={!!editingUser}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nama *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password {!editingUser && '*'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingUser ? 'Biarkan kosong jika tidak ingin mengubah' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={closeForm}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* User List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Tidak ada user yang cocok' : 'Belum ada user'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {user.role}
                      </span>
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEditForm(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Barang Management Component
function BarangManagement() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    satuanDefault: '',
    satuanAlternatif1: '',
    konversiAlternatif1: 0,
    satuanAlternatif2: '',
    konversiAlternatif2: 0,
    minStok: 10,
    kategori: ''
  });

  useEffect(() => {
    loadBarangList();
  }, []);

  const loadBarangList = async () => {
    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.getBarangList();
      if (result.success) {
        setBarangList(result.data || []);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data barang'
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setFormData({
      kode: '',
      nama: '',
      satuanDefault: '',
      satuanAlternatif1: '',
      konversiAlternatif1: 0,
      satuanAlternatif2: '',
      konversiAlternatif2: 0,
      minStok: 10,
      kategori: ''
    });
    setEditingBarang(null);
    setShowForm(true);
  };

  const openEditForm = (barang: Barang) => {
    setFormData({
      kode: barang.kode,
      nama: barang.nama,
      satuanDefault: barang.satuanDefault,
      satuanAlternatif1: barang.satuanAlternatif1 || '',
      konversiAlternatif1: barang.konversiAlternatif1 || 0,
      satuanAlternatif2: barang.satuanAlternatif2 || '',
      konversiAlternatif2: barang.konversiAlternatif2 || 0,
      minStok: barang.minStok,
      kategori: barang.kategori || ''
    });
    setEditingBarang(barang);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBarang(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kode.trim() || !formData.nama.trim() || !formData.satuanDefault.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Kode, nama, dan satuan default wajib diisi'
      });
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();

      let result;
      if (editingBarang) {
        result = await api.updateBarang(editingBarang.id, formData);
      } else {
        result = await api.createBarang(formData);
      }

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: editingBarang ? 'Barang berhasil diupdate' : 'Barang berhasil ditambahkan'
        });
        closeForm();
        loadBarangList();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menyimpan barang'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan barang'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (barangId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.deleteBarang(barangId);

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Barang berhasil dihapus'
        });
        loadBarangList();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menghapus barang'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus barang'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBarang = barangList.filter(barang =>
    barang.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barang.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Manajemen Barang
        </CardTitle>
        <CardDescription>Tambah, edit, dan hapus barang</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search & Add Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openAddForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Barang
            </Button>
          </div>

          {/* Barang Form */}
          {showForm && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="kode">Kode Barang *</Label>
                      <Input
                        id="kode"
                        value={formData.kode}
                        onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                        required
                        disabled={!!editingBarang}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Barang *</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="satuanDefault">Satuan Default *</Label>
                      <Input
                        id="satuanDefault"
                        value={formData.satuanDefault}
                        onChange={(e) => setFormData({ ...formData, satuanDefault: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minStok">Minimum Stok</Label>
                      <Input
                        id="minStok"
                        type="number"
                        min="0"
                        value={formData.minStok}
                        onChange={(e) => setFormData({ ...formData, minStok: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="satuanAlternatif1">Satuan Alternatif 1</Label>
                      <Input
                        id="satuanAlternatif1"
                        value={formData.satuanAlternatif1}
                        onChange={(e) => setFormData({ ...formData, satuanAlternatif1: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="konversiAlternatif1">Konversi ke Default 1</Label>
                      <Input
                        id="konversiAlternatif1"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.konversiAlternatif1}
                        onChange={(e) => setFormData({ ...formData, konversiAlternatif1: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="satuanAlternatif2">Satuan Alternatif 2</Label>
                      <Input
                        id="satuanAlternatif2"
                        value={formData.satuanAlternatif2}
                        onChange={(e) => setFormData({ ...formData, satuanAlternatif2: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="konversiAlternatif2">Konversi ke Default 2</Label>
                      <Input
                        id="konversiAlternatif2"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.konversiAlternatif2}
                        onChange={(e) => setFormData({ ...formData, konversiAlternatif2: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="kategori">Kategori</Label>
                      <Input
                        id="kategori"
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={closeForm}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Barang List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredBarang.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Tidak ada barang yang cocok' : 'Belum ada barang'}
              </div>
            ) : (
              filteredBarang.map((barang) => (
                <div key={barang.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{barang.nama}</div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {barang.kode} | Satuan: {barang.satuanDefault} | Min: {barang.minStok}
                    </div>
                    {barang.kategori && (
                      <div className="text-xs text-muted-foreground">Kategori: {barang.kategori}</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEditForm(barang)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(barang.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Log Component
function ActivityLogView() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.getActivityLog(100);
      if (result.success) {
        setLogs(result.data || []);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat activity log'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>Log aktivitas 100 terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Memuat activity log...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada aktivitas</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-medium">{log.userName}</span>
                    <span className="text-muted-foreground mx-2">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {log.ipAddress && (
                    <span className="text-xs text-muted-foreground">IP: {log.ipAddress}</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">{log.action}</span>
                  {log.details && ` - ${log.details}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export CSV Component
function ExportCSV() {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'transaksi_masuk' | 'transaksi_keluar' | 'stock_opname'>('transaksi_masuk');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async () => {
    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.exportCSV(exportType, startDate || undefined, endDate || undefined);

      if (result.success && result.data) {
        // Download CSV
        const blob = new Blob([result.data.content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Berhasil',
          description: `File ${result.data.filename} berhasil di-download`
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal mengekspor CSV'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat mengekspor CSV'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export CSV
        </CardTitle>
        <CardDescription>Ekspor data transaksi ke format CSV</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exportType">Tipe Export</Label>
            <Select value={exportType} onValueChange={(v) => setExportType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transaksi_masuk">Transaksi Barang Masuk</SelectItem>
                <SelectItem value="transaksi_keluar">Transaksi Barang Keluar</SelectItem>
                <SelectItem value="stock_opname">Stock Opname</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai (Opsional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir (Opsional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleExport} className="w-full" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Mengekspor...' : 'Export CSV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Admin Panel Component
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'barang' | 'activity' | 'export'>('users');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-muted-foreground">Manajemen user, barang, dan activity log</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="barang">
            <Package className="h-4 w-4 mr-2" />
            Barang
          </TabsTrigger>
          <TabsTrigger value="activity">
            <FileText className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="barang" className="mt-6">
          <BarangManagement />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityLogView />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportCSV />
        </TabsContent>
      </Tabs>
    </div>
  );
}
