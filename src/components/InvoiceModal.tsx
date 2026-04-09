import React from 'react';
import { Transaction } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { X, Printer } from 'lucide-react';

interface InvoiceModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function InvoiceModal({ transaction, onClose }: InvoiceModalProps) {
  const { user } = useAuth();

  if (!transaction || !user) return null;

  const handlePrint = () => {
    window.print();
  };

  const assetName = transaction.asset === 'GOLD' ? 'Vàng 9999' : transaction.asset === 'SILVER_KG' ? 'Bạc Thỏi (Kg)' : 'Bạc Ta';
  const unit = transaction.asset === 'SILVER_KG' ? 'Kg' : 'Chỉ';
  const txType = transaction.type === 'BUY' ? 'MUA VÀO' : 'BÁN RA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white text-black w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Actions - Hidden when printing */}
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b print:hidden">
          <h3 className="font-medium text-gray-700">Chi tiết hóa đơn</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors text-sm font-medium"
            >
              <Printer size={16} />
              In hóa đơn
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[80vh] print:max-h-none print:overflow-visible print:p-0" id="invoice-content">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-800 pb-4 sm:pb-6 mb-4 sm:mb-6 gap-4 sm:gap-0">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-1">ĐẦU TƯ</h1>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest">Nền tảng giao dịch trực tuyến</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-wider mb-1">Hóa Đơn</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-mono">Mã GD: #{transaction.id.toUpperCase()}</p>
              <p className="text-xs sm:text-sm text-gray-600">Ngày: {new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
              <p className="text-xs sm:text-sm text-gray-600">Giờ: {new Date(transaction.date).toLocaleTimeString('vi-VN')}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thông tin khách hàng</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 print:border-none print:bg-transparent print:p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                  <p className="font-medium text-gray-900 uppercase">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-medium text-gray-900 font-mono">{user.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Số CCCD/CMND</p>
                  <p className="font-medium text-gray-900 font-mono">{user.cccd}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Chi tiết giao dịch</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-gray-800 text-xs sm:text-sm">
                    <th className="py-2 sm:py-3 font-bold text-gray-800">Sản phẩm</th>
                    <th className="py-2 sm:py-3 font-bold text-gray-800">Loại GD</th>
                    <th className="py-2 sm:py-3 font-bold text-gray-800 text-right">Số lượng</th>
                    <th className="py-2 sm:py-3 font-bold text-gray-800 text-right">Đơn giá</th>
                    <th className="py-2 sm:py-3 font-bold text-gray-800 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 text-sm">
                    <td className="py-3 sm:py-4 font-medium text-gray-900">{assetName}</td>
                    <td className="py-3 sm:py-4">
                      <span className={`font-bold ${transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'}`}>
                        {txType}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 text-right font-mono">{transaction.amount.toLocaleString('vi-VN')} {unit}</td>
                    <td className="py-3 sm:py-4 text-right font-mono">{formatCurrency(transaction.pricePerUnit)}</td>
                    <td className="py-3 sm:py-4 text-right font-mono font-bold text-gray-900">{formatCurrency(transaction.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-8 sm:mb-12">
            <div className="w-full sm:w-1/2 bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 uppercase text-sm sm:text-base">Tổng cộng:</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-gold-600">{formatCurrency(transaction.total)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center pt-4 sm:pt-8">
            <div className="flex flex-col items-center">
              <p className="font-bold text-gray-800 mb-1">Khách hàng</p>
              <p className="text-sm text-gray-500 italic mb-4">(Ký và ghi rõ họ tên)</p>
              <div className="h-40 flex items-end justify-center">
                <p className="font-medium text-gray-900 uppercase">{user.fullName}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold text-gray-800 mb-1">Đại diện hệ thống</p>
              <p className="text-sm text-gray-500 italic mb-4">(Ký và đóng dấu)</p>
              
              {/* Stamp and Signature Container */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Red Stamp */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-36 h-36 text-red-600 opacity-80 transform -rotate-12 mix-blend-multiply">
                    <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="4"/>
                    <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1"/>
                    
                    <path id="textPathTop" d="M 25 100 A 75 75 0 0 1 175 100" fill="none" />
                    <path id="textPathBottom" d="M 25 100 A 75 75 0 0 0 175 100" fill="none" />
                    
                    <text fill="currentColor" fontSize="15" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
                      <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">CÔNG TY TNHH ĐẦU TƯ</textPath>
                    </text>
                    <text fill="currentColor" fontSize="18" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">
                      <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">★ ARU ★</textPath>
                    </text>
                    
                    <text x="100" y="112" textAnchor="middle" fill="currentColor" fontSize="38" fontWeight="900" fontFamily="serif">ARu</text>
                  </svg>
                </div>
                
                {/* Blue Signature */}
                <div className="absolute z-10 transform -rotate-12 translate-x-2 translate-y-2">
                  <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Great Vibes', cursive" }} className="text-5xl text-blue-800 opacity-90">
                    Minh
                  </span>
                </div>
              </div>

              <p className="font-bold text-gray-900 mt-2 uppercase">Nguyễn Hoàng Minh</p>
              <p className="text-xs text-gray-500">Giám đốc Giao dịch</p>
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4 print:mt-24">
            <p>Cảm ơn quý khách đã tin tưởng và giao dịch tại hệ thống của chúng tôi.</p>
            <p>Hóa đơn này có giá trị xác nhận giao dịch điện tử.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
