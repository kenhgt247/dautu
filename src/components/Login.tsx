import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cccd, setCccd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && phone && cccd) {
      login(fullName, phone, cccd);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-silver-400 to-gold-500 opacity-50"></div>
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl font-light tracking-tight text-gold-500 mb-2">Đầu Tư</h1>
          <p className="text-white/60 uppercase tracking-[0.2em] text-xs">Quản lý tài sản cá nhân</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8 text-white/40 text-sm bg-white/5 py-3 rounded-xl border border-white/5">
          <ShieldCheck size={18} className="text-gold-500" />
          <span>Xác thực danh tính nhà đầu tư</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
              className="w-full bg-ink border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
              placeholder="NGUYEN VAN A"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500/50 transition-colors font-mono"
              placeholder="0901234567"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Số CCCD / CMND</label>
            <input
              type="text"
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500/50 transition-colors font-mono"
              placeholder="079090123456"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-6 rounded-xl font-medium tracking-wide uppercase text-sm transition-all bg-gold-600 hover:bg-gold-500 text-ink shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            Truy cập hệ thống
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">
            Thông tin được mã hóa và lưu trữ an toàn trên thiết bị của bạn
          </p>
        </div>
      </div>
    </div>
  );
}
