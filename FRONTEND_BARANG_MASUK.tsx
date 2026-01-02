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
import { Upload, X, Plus, Search, Calendar, FileImage, Trash2, Package } from 'lucide-react';

interface Barang {
  id: string;
  kode: string;
  nama: string;
  satuanDefault: string;
  satuanAlternatif1: string;
  konversiAlternatif1: number;
  satuanAlternatif2: string;
  konversiAlternatif2: number;
  stok: number;
}

interface TransaksiItem {
  barangId: string;
  barangNama: string;
  barangKode: string;
  quantity: number;
  satuan: string;
  satuanOptions: string[];
}

interface Supplier {
  id: string;
  name: string;
}

export function BarangMasukForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [items, setItems] = useState<TransaksiItem[]>([]);

  // Form state
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nomorPO, setNomorPO] = useState('');
  const [nomorSuratJalan, setNomorSuratJalan] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Add item form state
  const [barangSearch, setBarangSearch] = useState('');
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [showBarangDropdown, setShowBarangDropdown] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [satuan, setSatuan] = useState('');

  // Photo upload state
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Load data
  useEffect(() => {
    loadBarangList();
    loadSupplierList();
  }, []);

  const loadBarangList = async () => {
    try {
      const api = getGasApiClient();
      const result = await api.getBarangList();
      if (result.success) {
        setBarangList(result.data || []);
      }
    } catch (error) {
      console.error('Error loading barang:', error);
    }
  };

  const loadSupplierList = async () => {
    try {
      const api = getGasApiClient();
      const result = await api.getSuppliers();
      if (result.success) {
        setSupplierList(result.data || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  // Autocomplete logic
  const filteredBarang = barangList.filter(barang =>
    barang.kode.toLowerCase().includes(barangSearch.toLowerCase()) ||
    barang.nama.toLowerCase().includes(barangSearch.toLowerCase())
  );

  const selectBarang = (barang: Barang) => {
    setSelectedBarang(barang);
    setBarangSearch(barang.nama);
    setSatuan(barang.satuanDefault);
    setShowBarangDropdown(false);
  };

  // Get available units for selected barang
  const getSatuanOptions = (barang: Barang | null): string[] => {
    if (!barang) return [];
    const options = [barang.satuanDefault];
    if (barang.satuanAlternatif1) options.push(barang.satuanAlternatif1);
    if (barang.satuanAlternatif2) options.push(barang.satuanAlternatif2);
    return options;
  };

  // Add item to transaction
  const addItem = () => {
    if (!selectedBarang) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih barang terlebih dahulu'
      });
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Quantity harus lebih dari 0'
      });
      return;
    }

    if (!satuan) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih satuan'
      });
      return;
    }

    const newItem: TransaksiItem = {
      barangId: selectedBarang.id,
      barangNama: selectedBarang.nama,
      barangKode: selectedBarang.kode,
      quantity: qty,
      satuan: satuan,
      satuanOptions: getSatuanOptions(selectedBarang)
    };

    setItems([...items, newItem]);

    // Reset form
    setSelectedBarang(null);
    setBarangSearch('');
    setQuantity('');
    setSatuan('');
  };

  // Remove item from transaction
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const api = getGasApiClient();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            const base64 = reader.result as string;
            const result = await api.uploadPhoto(base64);

            if (result.success) {
              setPhotos(prev => [...prev, result.data.fileUrl]);
              toast({
                title: 'Berhasil',
                description: `Foto ${i + 1} berhasil diupload`
              });
              resolve();
            } else {
              reject(new Error(result.message));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupload foto'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Submit transaction
  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Tambahkan minimal 1 barang'
      });
      return;
    }

    setLoading(true);
    try {
      const api = getGasApiClient();
      const result = await api.createTransaksiMasuk(
        {
          tanggal,
          nomorPO,
          nomorSuratJalan,
          supplierId,
          keterangan,
          items
        },
        photos
      );

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Transaksi barang masuk berhasil disimpan'
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menyimpan transaksi'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan transaksi'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Transaksi Barang Masuk</CardTitle>
          <CardDescription>Isi data transaksi barang masuk dengan lengkap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informasi Transaksi */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal Transaksi</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Pilih supplier" />
                </SelectTrigger>
                <SelectContent>
                  {supplierList.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                  {supplierList.length === 0 && (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      Belum ada supplier
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorPO">Nomor PO</Label>
              <Input
                id="nomorPO"
                placeholder="Masukkan nomor PO"
                value={nomorPO}
                onChange={(e) => setNomorPO(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorSuratJalan">Nomor Surat Jalan</Label>
              <Input
                id="nomorSuratJalan"
                placeholder="Masukkan nomor surat jalan"
                value={nomorSuratJalan}
                onChange={(e) => setNomorSuratJalan(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              placeholder="Tambahkan keterangan transaksi (opsional)"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload Foto */}
          <div className="space-y-2">
            <Label>Upload Foto</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
              <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop foto atau klik untuk memilih file
              </p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="cursor-pointer"
              />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tambah Barang */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Barang</CardTitle>
          <CardDescription>Tambahkan barang ke transaksi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Autocomplete Barang */}
          <div className="space-y-2">
            <Label htmlFor="barang">Cari Barang</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="barang"
                placeholder="Cari nama atau kode barang..."
                value={barangSearch}
                onChange={(e) => {
                  setBarangSearch(e.target.value);
                  setShowBarangDropdown(true);
                }}
                onFocus={() => setShowBarangDropdown(true)}
                className="pl-10"
              />
              {showBarangDropdown && barangSearch && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredBarang.length > 0 ? (
                    filteredBarang.map((barang) => (
                      <div
                        key={barang.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => selectBarang(barang)}
                      >
                        <div className="font-medium">{barang.nama}</div>
                        <div className="text-sm text-muted-foreground">
                          Kode: {barang.kode} | Stok: {barang.stok} {barang.satuanDefault}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-muted-foreground">
                      Tidak ada barang ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quantity & Satuan */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="Masukkan quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan</Label>
              <Select
                value={satuan}
                onValueChange={setSatuan}
                disabled={!selectedBarang}
              >
                <SelectTrigger id="satuan">
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {getSatuanOptions(selectedBarang).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addItem} className="w-full" disabled={!selectedBarang}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah ke Daftar
          </Button>
        </CardContent>
      </Card>

      {/* Preview Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Barang</CardTitle>
            <CardDescription>Preview barang yang akan ditambahkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.barangNama}</div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {item.barangKode} | Qty: {item.quantity} {item.satuan}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total barang:</span>
                <span className="font-medium">{items.length} item</span>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full mt-4" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
