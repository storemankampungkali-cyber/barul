'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getGasApiClient } from '@/lib/gas-api';
import { ArrowLeftRight, X, Plus, Search, Calendar, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

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
  stokTersedia: number;
  stokTersediaDefault: number;
}

export function BarangKeluarForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [items, setItems] = useState<TransaksiItem[]>([]);

  // Form state
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

  // Add item form state
  const [barangSearch, setBarangSearch] = useState('');
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [showBarangDropdown, setShowBarangDropdown] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [satuan, setSatuan] = useState('');
  const [stokTersedia, setStokTersedia] = useState<number>(0);

  // Load data
  useEffect(() => {
    loadBarangList();
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

  // Autocomplete logic
  const filteredBarang = barangList.filter(barang =>
    barang.kode.toLowerCase().includes(barangSearch.toLowerCase()) ||
    barang.nama.toLowerCase().includes(barangSearch.toLowerCase())
  );

  const selectBarang = (barang: Barang) => {
    setSelectedBarang(barang);
    setBarangSearch(barang.nama);
    setSatuan(barang.satuanDefault);
    setStokTersedia(barang.stok);
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

  // Calculate stock in selected unit
  const calculateStokInUnit = (stokDefault: number, selectedSatuan: string, barang: Barang): number => {
    if (selectedSatuan === barang.satuanDefault) {
      return stokDefault;
    } else if (selectedSatuan === barang.satuanAlternatif1 && barang.konversiAlternatif1) {
      return stokDefault / barang.konversiAlternatif1;
    } else if (selectedSatuan === barang.satuanAlternatif2 && barang.konversiAlternatif2) {
      return stokDefault / barang.konversiAlternatif2;
    }
    return stokDefault;
  };

  // Calculate quantity in default unit for validation
  const calculateQuantityDefault = (qty: number, selectedSatuan: string, barang: Barang): number => {
    if (selectedSatuan === barang.satuanDefault) {
      return qty;
    } else if (selectedSatuan === barang.satuanAlternatif1 && barang.konversiAlternatif1) {
      return qty * barang.konversiAlternatif1;
    } else if (selectedSatuan === barang.satuanAlternatif2 && barang.konversiAlternatif2) {
      return qty * barang.konversiAlternatif2;
    }
    return qty;
  };

  // Validate quantity against available stock
  const validateQuantity = (qty: number): boolean => {
    if (!selectedBarang) return false;
    const qtyDefault = calculateQuantityDefault(qty, satuan, selectedBarang);
    return qtyDefault <= selectedBarang.stok;
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

    // Validate stock
    if (!validateQuantity(qty)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Stok tidak mencukupi. Stok tersedia: ${stokTersedia} ${satuan}`
      });
      return;
    }

    // Check if item already exists
    const existingIndex = items.findIndex(item => item.barangId === selectedBarang.id);
    if (existingIndex >= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Barang sudah ada di daftar. Hapus item terlebih dahulu untuk mengubah quantity.'
      });
      return;
    }

    const newItem: TransaksiItem = {
      barangId: selectedBarang.id,
      barangNama: selectedBarang.nama,
      barangKode: selectedBarang.kode,
      quantity: qty,
      satuan: satuan,
      satuanOptions: getSatuanOptions(selectedBarang),
      stokTersedia: stokTersedia,
      stokTersediaDefault: selectedBarang.stok
    };

    setItems([...items, newItem]);

    // Reset form
    setSelectedBarang(null);
    setBarangSearch('');
    setQuantity('');
    setSatuan('');
    setStokTersedia(0);
  };

  // Remove item from transaction
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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
      const result = await api.createTransaksiKeluar({
        tanggal,
        keterangan,
        items
      });

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Transaksi barang keluar berhasil disimpan'
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

  // Check if quantity exceeds stock
  const isQuantityExceeded = (): boolean => {
    if (!selectedBarang || !quantity) return false;
    const qty = parseFloat(quantity);
    return !validateQuantity(qty);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Transaksi Barang Keluar</CardTitle>
          <CardDescription>Isi data transaksi barang keluar dengan lengkap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informasi Transaksi */}
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
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              placeholder="Tambahkan keterangan transaksi (opsional)"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tambah Barang */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Barang</CardTitle>
          <CardDescription>Tambahkan barang ke transaksi keluar</CardDescription>
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

          {/* Real-time Stock Info */}
          {selectedBarang && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`h-4 w-4 ${isQuantityExceeded() ? 'text-destructive' : 'text-primary'}`} />
                <span className="font-medium">Stok Tersedia:</span>
                <span className="font-bold">{stokTersedia}</span>
                <span>{satuan}</span>
              </div>
            </div>
          )}

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
                className={isQuantityExceeded() ? 'border-destructive' : ''}
              />
              {isQuantityExceeded() && (
                <p className="text-xs text-destructive mt-1">
                  Quantity melebihi stok tersedia ({stokTersedia} {satuan})
                </p>
              )}
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

          <Button
            onClick={addItem}
            className="w-full"
            disabled={!selectedBarang || !quantity || !satuan || isQuantityExceeded()}
          >
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
            <CardDescription>Preview barang yang akan dikeluarkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.barangNama}</div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {item.barangKode} | Qty: {item.quantity} {item.satuan} | Stok: {item.stokTersedia} {item.satuan}
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
