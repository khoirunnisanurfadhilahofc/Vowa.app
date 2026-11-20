import React, { useState } from 'react';
import { EmergencyContact } from '../types';
import { UserPlus, Trash2, Phone, ShieldCheck, Heart } from 'lucide-react';

interface EmergencyContactsManagerProps {
  contacts: EmergencyContact[];
  onSaveContacts: (contacts: EmergencyContact[]) => void;
}

export const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  contacts,
  onSaveContacts,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Keluarga');
  const [phone, setPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: 'ct-' + Date.now(),
      name: name.trim(),
      relationship,
      phone: phone.trim(),
    };

    onSaveContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onSaveContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">Kontak Darurat Tepercaya</h3>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {contacts.length} Tersimpan
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Menerima pesan WhatsApp 1-klik saat Anda memicu tombol SOS di kendaraan
          </p>
        </div>

        {!isAdding && contacts.length < 5 && (
          <button
            onClick={() => setIsAdding(true)}
            className="py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-rose-400" />
            <span>Tambah Kontak</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="my-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div className="text-xs font-bold text-stone-800">Tambah Kontak Darurat Baru</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap / Panggilan"
              className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
            />
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none"
            >
              <option value="Keluarga">Keluarga (Ibu / Ayah / Saudara)</option>
              <option value="Pasangan">Pasangan</option>
              <option value="Sahabat">Sahabat / Teman Dekat</option>
              <option value="Rekan Kerja">Rekan Kerja / Kampus</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="No. WhatsApp (0812xxxx)"
              className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="py-1.5 px-3 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-1.5 px-4 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl cursor-pointer"
            >
              Simpan Kontak
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-4 space-y-2.5">
        {contacts.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-500">
            Belum ada kontak darurat. Klik tombol "Tambah Kontak" di atas untuk menambahkan kerabat tepercaya Anda.
          </div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors border border-stone-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{c.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    {c.relationship} · {c.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${c.phone}`}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors"
                  title="Telepon Langsung"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Hapus Kontak"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
