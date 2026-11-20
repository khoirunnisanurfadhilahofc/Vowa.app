import { DriverRegistryItem } from '../types';

export const DRIVER_REGISTRY_DATA: DriverRegistryItem[] = [
  {
    plateNumber: 'B 1942 SRA',
    driverName: 'Pak Hendra Kusuma',
    serviceProvider: 'Gojek',
    vehicleType: 'Mobil (Car)',
    vehicleModel: 'Toyota Avanza 1.3 G',
    vehicleColor: 'Silver Metalik',
    safetyScore: 99,
    safetyStatus: 'Terverifikasi Aman',
    certificationNote: 'Lulus Sertifikasi Pelatihan Aman KemenPPPA & SOP Anti-Pelecehan Seksual (2026)',
    reportedIncidentsCount: 0,
    registeredCity: 'DKI Jakarta (Polda Metro Jaya)',
    lastUpdated: '10 November 2026',
  },
  {
    plateNumber: 'B 2714 WXQ',
    driverName: 'M. Syarif Hidayatullah',
    serviceProvider: 'Grab',
    vehicleType: 'Mobil (Car)',
    vehicleModel: 'Daihatsu Xenia 1.5 R',
    vehicleColor: 'Hitam Solid',
    safetyScore: 97,
    safetyStatus: 'Terverifikasi Aman',
    certificationNote: 'Driver Bintang 5 GrabSafe Verified, Bebas Catatan Disiplin',
    reportedIncidentsCount: 0,
    registeredCity: 'Jakarta Selatan',
    lastUpdated: '08 November 2026',
  },
  {
    plateNumber: 'B 2481 PKX',
    driverName: 'R. Hidayat',
    serviceProvider: 'Gojek',
    vehicleType: 'Mobil (Car)',
    vehicleModel: 'Suzuki Ertiga GL',
    vehicleColor: 'Putih Mutiara',
    safetyScore: 68,
    safetyStatus: 'Waspada / Catatan Keamanan',
    certificationNote: 'Pernah dilaporkan oleh 2 penumpang terkait komentar verbal tidak pantas & tatapan mencurigakan di spion tengah',
    reportedIncidentsCount: 2,
    registeredCity: 'Jakarta Timur',
    lastUpdated: '18 Oktober 2026',
  },
  {
    plateNumber: 'B 3821 TZF',
    driverName: 'Bagus Pratama Putra',
    serviceProvider: 'Maxim',
    vehicleType: 'Motor (Bike)',
    vehicleModel: 'Honda Vario 160 CBS',
    vehicleColor: 'Merah Doff',
    safetyScore: 98,
    safetyStatus: 'Terverifikasi Aman',
    certificationNote: 'Helm ganda higienis SNI terverifikasi, riwayat rute tepat waktu',
    reportedIncidentsCount: 0,
    registeredCity: 'Depok / Margonda',
    lastUpdated: '04 November 2026',
  },
  {
    plateNumber: 'D 1842 KFG',
    driverName: 'Asep Supriatna',
    serviceProvider: 'inDrive',
    vehicleType: 'Mobil (Car)',
    vehicleModel: 'Honda Brio Satya E',
    vehicleColor: 'Abu-Abu Baja',
    safetyScore: 96,
    safetyStatus: 'Terverifikasi Aman',
    certificationNote: 'Kamera Dashboard (Dashcam) Kabin Aktif, Terdaftar Resmi Polrestabes Bandung',
    reportedIncidentsCount: 0,
    registeredCity: 'Bandung Raya (Polda Jabar)',
    lastUpdated: '01 November 2026',
  },
  {
    plateNumber: 'L 4567 JK',
    driverName: 'Wahyu Nugroho',
    serviceProvider: 'Grab',
    vehicleType: 'Motor (Bike)',
    vehicleModel: 'Yamaha NMAX 155',
    vehicleColor: 'Biru Tua Matte',
    safetyScore: 99,
    safetyStatus: 'Terverifikasi Aman',
    certificationNote: 'Duta SafeRide Komunitas Ojol Jawa Timur, Surat Bebas Narkoba Terverifikasi',
    reportedIncidentsCount: 0,
    registeredCity: 'Surabaya (Polda Jatim)',
    lastUpdated: '07 November 2026',
  },
  {
    plateNumber: 'B 1109 SOS',
    driverName: 'Suryanto B.',
    serviceProvider: 'Taksi / Lainnya',
    vehicleType: 'Mobil (Car)',
    vehicleModel: 'Toyota Transmover (Taksi)',
    vehicleColor: 'Biru Metalik',
    safetyScore: 54,
    safetyStatus: 'Waspada / Catatan Keamanan',
    certificationNote: 'Penyimpangan rute dilaporkan 3 kali saat larut malam; hindari perjalanan sendiri tanpa pengawasan wali',
    reportedIncidentsCount: 3,
    registeredCity: 'Jakarta Pusat',
    lastUpdated: '29 Oktober 2026',
  },
];

/**
 * Helper to lookup driver info by clean plate string
 */
export function lookupDriverByPlate(inputPlate: string): DriverRegistryItem | null {
  const normalized = inputPlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!normalized) return null;

  return (
    DRIVER_REGISTRY_DATA.find((item) => {
      const itemNormalized = item.plateNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      return itemNormalized === normalized;
    }) || null
  );
}

/**
 * Filter drivers by query
 */
export function searchDriverRegistry(query: string): DriverRegistryItem[] {
  if (!query.trim()) return DRIVER_REGISTRY_DATA;
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  return DRIVER_REGISTRY_DATA.filter(
    (item) =>
      item.plateNumber.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q) ||
      item.driverName.toLowerCase().includes(query.toLowerCase()) ||
      item.registeredCity.toLowerCase().includes(query.toLowerCase()) ||
      item.vehicleModel.toLowerCase().includes(query.toLowerCase())
  );
}
