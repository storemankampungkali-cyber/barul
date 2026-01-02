// API Client untuk Google Apps Script

const GAS_API_URL = process.env.NEXT_PUBLIC_GAS_API_URL || '';

interface GASResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

class GasApiClient {
  private apiUrl: string;
  private token: string | null = null;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async get<T>(params: Record<string, string>): Promise<GASResponse<T>> {
    try {
      const url = new URL(this.apiUrl);
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('GET Response text:', text);

      // Handle different response formats from GAS
      let data: any;
      try {
        // Try parsing as JSON
        data = JSON.parse(text);
      } catch (e) {
        // If JSON parsing fails, return error response
        console.error('JSON parse error:', e, 'Response text:', text);
        return {
          success: false,
          data: null as T,
          message: `Invalid response format: ${text}`,
          timestamp: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.error('GET request error:', error);
      return {
        success: false,
        data: null as T,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async post<T>(body: any): Promise<GASResponse<T>> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('POST Response text:', text);

      // Handle different response formats from GAS
      let data: any;
      try {
        // Try parsing as JSON
        data = JSON.parse(text);
      } catch (e) {
        // If JSON parsing fails, return error response
        console.error('JSON parse error:', e, 'Response text:', text);
        return {
          success: false,
          data: null as T,
          message: `Invalid response format: ${text}`,
          timestamp: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.error('POST request error:', error);
      return {
        success: false,
        data: null as T,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Auth
  async login(username: string, password: string) {
    return this.post({
      action: 'login',
      username,
      password,
      ip: 'web-client'
    });
  }

  async verifySession() {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'verify_session',
      token: this.token
    });
  }

  async logout() {
    if (!this.token) return { success: true, data: null, message: 'Logged out', timestamp: '' };
    const result = await this.post({
      action: 'logout',
      token: this.token
    });
    this.clearToken();
    return result;
  }

  // Dashboard
  async getDashboardStats() {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_dashboard_stats',
      token: this.token
    });
  }

  // Barang
  async getBarangList(search: string = '') {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_barang_list',
      token: this.token,
      search
    });
  }

  async getBarangDetail(barangId: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_barang_detail',
      token: this.token,
      barang_id: barangId
    });
  }

  async createBarang(barang: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'create_barang',
      token: this.token,
      barang
    });
  }

  async updateBarang(barangId: string, barang: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'update_barang',
      token: this.token,
      barang_id: barangId,
      barang
    });
  }

  async deleteBarang(barangId: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'delete_barang',
      token: this.token,
      barang_id: barangId
    });
  }

  // Suppliers
  async getSuppliers() {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_suppliers',
      token: this.token
    });
  }

  async createSupplier(supplier: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'create_supplier',
      token: this.token,
      supplier
    });
  }

  async updateSupplier(supplierId: string, supplier: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'update_supplier',
      token: this.token,
      supplier_id: supplierId,
      supplier
    });
  }

  async deleteSupplier(supplierId: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'delete_supplier',
      token: this.token,
      supplier_id: supplierId
    });
  }

  // Transaksi Masuk
  async createTransaksiMasuk(transaksi: any, photos: any[] = []) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'create_transaksi_masuk',
      token: this.token,
      transaksi,
      photos
    });
  }

  async getTransaksiMasuk(startDate?: string, endDate?: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_transaksi_masuk',
      token: this.token,
      start_date: startDate || '',
      end_date: endDate || ''
    });
  }

  // Transaksi Keluar
  async createTransaksiKeluar(transaksi: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'create_transaksi_keluar',
      token: this.token,
      transaksi
    });
  }

  async getTransaksiKeluar(startDate?: string, endDate?: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_transaksi_keluar',
      token: this.token,
      start_date: startDate || '',
      end_date: endDate || ''
    });
  }

  // Stock Opname
  async createStockOpname(stockOpname: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'create_stock_opname',
      token: this.token,
      stock_opname: stockOpname
    });
  }

  async getStockOpname(startDate?: string, endDate?: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'get_stock_opname',
      token: this.token,
      start_date: startDate || '',
      end_date: endDate || ''
    });
  }

  // Activity Log (Admin only)
  async getActivityLog(limit: number = 100) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'get_activity_log',
      token: this.token,
      limit: limit.toString()
    });
  }

  // User Management (Admin only)
  async getUsers() {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'get_users',
      token: this.token
    });
  }

  async createUser(user: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'create_user',
      token: this.token,
      user
    });
  }

  async updateUser(userId: string, user: any) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'update_user',
      token: this.token,
      user_id: userId,
      user
    });
  }

  async deleteUser(userId: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'delete_user',
      token: this.token,
      user_id: userId
    });
  }

  // Photo Upload
  async uploadPhoto(photoData: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.post({
      action: 'upload_photo',
      token: this.token,
      photo_data: photoData
    });
  }

  // Export CSV
  async exportCSV(type: string, startDate?: string, endDate?: string) {
    if (!this.token) {
      return { success: false, data: null, message: 'No token', timestamp: '' };
    }
    return this.get({
      action: 'export_csv',
      token: this.token,
      type,
      start_date: startDate || '',
      end_date: endDate || ''
    });
  }
}

// Singleton instance
let gasApiClient: GasApiClient | null = null;

export function getGasApiClient(): GasApiClient {
  if (!gasApiClient) {
    gasApiClient = new GasApiClient(GAS_API_URL);
  }
  return gasApiClient;
}

export default GasApiClient;
