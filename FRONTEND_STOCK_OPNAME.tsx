'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { getGasApiClient } from '@/lib/gas-api';
import { Calculator, FileText, CheckCircle, AlertTriangle, X, Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';

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

interface StockOpnameItem {
  barangId: string;
  barangNama: string;
  barangKode: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  satuan: string;
  satuanOptions: string[];
  keterangan: string;
}

export function StockOpnameForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [items, setItems] = useState<StockOpnameItem[]>([]);

  // Form state
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

  // Add item form state
  const [barangSearch, setBarangSearch] = useState('');
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [showBarangDropdown, setShowBarangDropdown] = useState(false);
  const [stokFisik, setStokFisik] = useState('');
  const [satuan, setSatuan] = useState('');
  const [itemKeterangan, setItemKeterangan] = useState('');

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

  // Calculate selisih in selected unit (for display)
  const calculateSelisihDisplay = (stokFisik: number, selectedSatuan: string, barang: Barang): number => {
    if (selectedSatuan === barang.satuanDefault) {
      return stokFisik - barang.minStok;
    } else if (selectedSatuan === barang.satuanAlternatif1 && barang.konversiAlternatif1) {
      const stokSistemInUnit = barang.minStok / barang.konversiAlternatif1;
      return stokFisik - stokSistemInUnit;
    } else if (selectedSatuan === barang.satuanAlternatif2 && barang.konversiAlternatif2) {
      const stokSistemInUnit = barang.minStok / barang.konversiAlternatif2;
      return stokFisik - stokSistemInUnit;
    }
    return stokFisik - barang.minStok;
  };

  // Get system stock in selected unit for display
  const getStokSistemInUnit = (barang: Barang, selectedSatuan: string): number => {
    return calculateStokInUnit(barang.minStok, selectedSatuan, barang);
  };

  // Update available stock when unit changes
  useEffect(() => {
    if (selectedBarang && satuan) {
      setStokFisik(getStokSistemInUnit(selectedBarang, satuan).toString());
    }
  }, [satuan, selectedBarang]);

  // Add item to stock opname
  const addItem = () => {
    if (!selectedBarang) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih barang terlebih dahulu'
      });
      return;
    }

    const stokFisikNum = parseFloat(stokFisik);
    if (isNaN(stokFisikNum) || stokFisikNum < 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Masukkan stok fisik yang valid'
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

    const stokSistemInUnit = getStokSistemInUnit(selectedBarang, satuan);
    const selisihDisplay = calculateSelisihDisplay(stokFisikNum, satuan, selectedBarang);
    const hasSelisih = Math.abs(selisihDisplay) > 0.01;

    // Check if item already exists
    const existingIndex = items.findIndex(item => item.barangId === selectedBarang.id);
    if (existingIndex >= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Barang sudah ada di daftar. Hapus item terlebih dahulu untuk mengubah.'
      });
      return;
    }

    const newItem: StockOpnameItem = {
      barangId: selectedBarang.id,
      barangNama: selectedBarang.nama,
      barangKode: selectedBarang.kode,
      stokSistem: stokSistemInUnit,
      stokFisik: stokFisikNum,
      selisih: selisihDisplay,
      satuan: satuan,
      satuanOptions: getSatuanOptions(selectedBarang),
      keterangan: itemKeterangan
    };

    setItems([...items, newItem]);

    // Reset form
    setSelectedBarang(null);
    setBarangSearch('');
    setStokFisik('');
    setSatuan('');
    setItemKeterangan('');
  };

  // Remove item from list
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Submit stock opname
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

      // Convert items to default unit format
      const itemsDefault = items.map(item => {
        const barang = barangList.find(b => b.id === item.barangId);
        if (!barang) return item;

        let stokFisikDefault = item.stokFisik;
        if (item.satuan === barang.satuanAlternatif1 && barang.konversiAlternatif1) {
          stokFisikDefault = item.stokFisik * barang.konversiAlternatif1;
        } else if (item.satuan === barang.satuanAlternatif2 && barang.konversiAlternatif2) {
          stokFisikDefault = item.stokFisik * barang.konversiAlternatif2;
        }

        return {
          barangId: item.barangId,
          stokFisik: stokFisikDefault,
          satuan: barang.satuanDefault,
          keterangan: item.keterangan
        };
      });

      const result = await api.createStockOpname({
        tanggal,
        keterangan,
        items: itemsDefault
      });

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Stock opname berhasil disimpan'
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Gagal menyimpan stock opname'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan stock opname'
      });
    } finally {
      setLoading(false);
    }
  };

  const stokSistemDisplay = selectedBarang && satuan ? getStokSistemInUnit(selectedBarang, satuan) : 0;
  const selisihDisplay = selectedBarang && satuan && stokFisik ? calculateSelisihDisplay(parseFloat(stokFisik), satuan, selectedBarang) : 0;
  const hasSelisih = Math.abs(selisihDisplay) > 0.01;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Stock Opname</CardTitle>
          <CardDescription>Catat stok fisik dan hitung selisih</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informasi Transaksi */}
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal Stock Opname</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            <Label htmlFor="keterangan">Keterangan Umum</Label>
            <Textarea
              id="keterangan"
              placeholder="Tambahkan keterangan stock opname (opsional)"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tambah Barang */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Barang</CardTitle>
          <CardDescription>Input stok fisik dan sistem akan menghitung selisih otomatis</CardDescription>
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
                          Kode: {barang.kode} | Stok Sistem: {barang.minStok} {barang.satuanDefault}
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

          {/* System Stock Info */}
          {selectedBarang && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Stok Sistem:</span>
                <span className="font-bold">{stokSistemDisplay}</span>
                <span>{satuan}</span>
              </div>
            </div>
          )}

          {/* Stok Fisik & Satuan */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stokFisik">Stok Fisik</Label>
              <Input
                id="stokFisik"
                type="number"
                min="0"
                step="0.01"
                placeholder="Masukkan stok fisik"
                value={stokFisik}
                onChange={(e) => setStokFisik(e.target.value)}
                className={hasSelisih ? 'border-primary' : ''}
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

          {/* Selisih Info */}
          {selectedBarang && stokFisik && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${hasSelisih ? 'bg-primary/10' : 'bg-green-500/10'}`}>
              {hasSelisih ? (
                <AlertTriangle className="h-4 w-4 text-primary" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <div className="text-sm">
                <span className="font-medium">Selisih: </span>
                <span className={`font-bold ${selisihDisplay > 0 ? 'text-green-600' : selisihDisplay < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selisihDisplay > 0 ? '+' : ''}{selisihDisplay}
                </span>
                <span> {satuan}</span>
                {hasSelisih && (
                  <span className="ml-2 text-muted-foreground">
                    (Sistem akan melakukan koreksi otomatis)
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="itemKeterangan">Keterangan Item (Opsional)</Label>
            <Input
              id="itemKeterangan"
              placeholder="Tambahkan keterangan untuk item ini"
              value={itemKeterangan}
              onChange={(e) => setItemKeterangan(e.target.value)}
            />
          </div>

          <Button
            onClick={addItem}
            className="w-full"
            disabled={!selectedBarang || !stokFisik || !satuan}
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
            <CardDescription>Preview hasil stock opname</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.barangNama}</div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {item.barangKode} | Sistem: {item.stokSistem} {item.satuan} | Fisik: {item.stokFisik} {item.satuan}
                    </div>
                    <div className={`text-sm font-medium mt-1 ${Math.abs(item.selisih) > 0 ? 'text-primary' : 'text-green-600'}`}>
                      Selisih: {item.selisih > 0 ? '+' : ''}{item.selisih} {item.satuan}
                      {Math.abs(item.selisih) > 0 && ' (Perlu koreksi)'}
                    </div>
                    {item.keterangan && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Ket: {item.keterangan}
                      </div>
                    )}
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
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total barang:</span>
                <span className="font-medium">{items.length} item</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ada selisih:</span>
                <span className={`font-medium ${items.some(i => Math.abs(i.selisih) > 0) ? 'text-primary' : 'text-green-600'}`}>
                  {items.some(i => Math.abs(i.selisih) > 0) ? 'Ya' : 'Tidak'}
                </span>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full mt-4" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Stock Opname'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
