'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { getGasApiClient } from '@/lib/gas-api';
import { Package, Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.getSuppliers();
      if (result.success) {
        setSuppliers(result.data || []);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data supplier'
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: ''
    });
    setEditingSupplier(null);
    setShowForm(true);
  };

  const openEditForm = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contact: supplier.contact || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Nama supplier wajib diisi'
      });
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();

      let result;
      if (editingSupplier) {
        result = await api.updateSupplier(editingSupplier.id, formData);
      } else {
        result = await api.createSupplier(formData);
      }

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: editingSupplier ? 'Supplier berhasil diupdate' : 'Supplier berhasil ditambahkan'
        });
        closeForm();
        loadSuppliers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menyimpan supplier'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan supplier'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.deleteSupplier(supplierId);

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Supplier berhasil dihapus'
        });
        loadSuppliers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menghapus supplier'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus supplier'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Supplier</CardTitle>
          <CardDescription>Tambah, edit, dan hapus supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search & Add Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={openAddForm}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Supplier
              </Button>
            </div>

            {/* Supplier Form */}
            {showForm && (
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Supplier *</Label>
                        <Input
                          id="name"
                          placeholder="Masukkan nama supplier"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact">Kontak Person</Label>
                        <Input
                          id="contact"
                          placeholder="Nama kontak person"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">No. Telepon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="Masukkan nomor telepon"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Masukkan email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Alamat</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="address"
                            placeholder="Masukkan alamat lengkap"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={2}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={closeForm}>
                        <Trash2 className="h-4 w-4 mr-2" />
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

            {/* Supplier List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading && suppliers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Memuat data supplier...
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Tidak ada supplier yang cocok dengan pencarian' : 'Belum ada supplier'}
                  </p>
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{supplier.name}</h3>

                        {supplier.contact && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Kontak:</span> {supplier.contact}
                          </div>
                        )}

                        {supplier.phone && (
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}

                        {supplier.email && (
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}

                        {supplier.address && (
                          <div className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
                            <MapPin className="h-3 w-4 mt-0.5" />
                            {supplier.address}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button size="icon" variant="ghost" onClick={() => openEditForm(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(supplier.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && suppliers.length > 0 && (
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground text-center">
                Total {filteredSuppliers.length} supplier
                {searchTerm && ` (dari ${suppliers.length} total)`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
