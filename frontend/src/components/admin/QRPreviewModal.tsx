import React, { useEffect, useState } from 'react';
import type { TableInfo, CafeInfo } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Printer, ExternalLink, Coffee, Sparkles } from 'lucide-react';

interface QRPreviewModalProps {
  table: TableInfo | null;
  cafe: CafeInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRPreviewModal: React.FC<QRPreviewModalProps> = ({
  table,
  cafe,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (table && isOpen) {
      setIsLoading(true);
      api
        .getQRImageData(table.qrToken)
        .then((res) => {
          setQrDataUrl(res.qrDataUrl);
          setMenuUrl(res.menuUrl);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [table, isOpen]);

  if (!table) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=650,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cafe?.name || 'TeaWala'} QR Standee - ${table.number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
            body {
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .teacup-card {
              position: relative;
              width: 320px;
              background: #1C120E;
              border: 5px solid #4E3427;
              border-bottom-left-radius: 4.5rem;
              border-bottom-right-radius: 4.5rem;
              border-top-left-radius: 1.5rem;
              border-top-right-radius: 1.5rem;
              padding: 24px 20px;
              color: #ffffff;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.3);
              margin: 30px auto;
            }
            .teacup-rim {
              position: absolute;
              top: 0;
              left: 16px;
              right: 16px;
              height: 8px;
              background: linear-gradient(90deg, #f59e0b, #00F5D4, #f59e0b);
              border-bottom-left-radius: 6px;
              border-bottom-right-radius: 6px;
            }
            .teacup-handle {
              position: absolute;
              right: -30px;
              top: 90px;
              width: 40px;
              height: 110px;
              border: 6px solid #4E3427;
              border-left: 0;
              border-top-right-radius: 2rem;
              border-bottom-right-radius: 2rem;
              background: transparent;
            }
            .tea-tag {
              position: absolute;
              top: -12px;
              left: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .tag-string {
              width: 2px;
              height: 24px;
              background: #f59e0b;
            }
            .tag-label {
              background: linear-gradient(90deg, #f59e0b, #d97706);
              color: #000;
              font-weight: 900;
              font-size: 11px;
              padding: 3px 12px;
              border-radius: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border: 1px solid #fbbf24;
            }
            .qr-box {
              background: #ffffff;
              padding: 12px;
              border-radius: 16px;
              border: 2px solid #33221B;
              display: inline-block;
              margin: 12px 0;
            }
            .qr-img {
              width: 180px;
              height: 180px;
              display: block;
            }
            .cta-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #ffffff;
              margin-top: 4px;
            }
            .cta-sub {
              font-size: 10px;
              color: #a8a29e;
              margin-top: 2px;
            }
            .saucer-base {
              position: absolute;
              bottom: -16px;
              left: 50%;
              transform: translateX(-50%);
              width: 200px;
              height: 14px;
              background: #38241D;
              border-radius: 20px;
              border: 1px solid #5E3E30;
            }
            @media print {
              body { background: none; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          <div class="teacup-card">
            <div class="teacup-rim"></div>
            <div class="teacup-handle"></div>
            
            <div class="tea-tag">
              <div class="tag-string"></div>
              <div class="tag-label">
                ${table.number}
              </div>
            </div>

            <div style="margin-top:12px; margin-bottom:12px;">
              <div style="font-size:22px; font-weight:900; color:#00F5D4;">tea<span style="color:#ffffff;">wala</span></div>
            </div>

            <div class="qr-box">
              <img src="${qrDataUrl}" class="qr-img" />
            </div>

            <div class="cta-title">
              Scan to View Menu & Order
            </div>
            <div class="cta-sub">
              No App Download Required • Smart Table QR
            </div>

            <div class="saucer-base"></div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center printable-qr-modal py-2">
        {/* Teacup Shaped QR Card Container */}
        <div className="relative max-w-xs mx-auto my-4 pt-4 pb-2">
          
          {/* Steam Animation Elements above Teacup Rim */}
          <div className="flex justify-center items-center gap-4 mb-1 h-7 overflow-hidden pointer-events-none">
            <svg className="w-5 h-7 text-amber-400/70 animate-steam-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 21c-2-2.5-2-4.5 0-7s0-4.5 0-7" strokeLinecap="round" />
            </svg>
            <svg className="w-6 h-7 text-[#00F5D4]/80 animate-steam-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 21c2-2.5 2-4.5 0-7s0-4.5 0-7" strokeLinecap="round" />
            </svg>
            <svg className="w-5 h-7 text-amber-400/70 animate-steam-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 21c-2-2.5-2-4.5 0-7s0-4.5 0-7" strokeLinecap="round" />
            </svg>
          </div>

          {/* Teacup Outer Shell & Teacup Handle */}
          <div className="relative bg-[#1C120E] border-4 border-[#4E3427] rounded-b-[4.5rem] rounded-t-3xl p-6 sm:p-7 shadow-2xl overflow-visible text-white">
            
            {/* Teacup Rim Lip Line (Top Decorative Accent) */}
            <div className="absolute top-0 left-4 right-4 h-2 bg-gradient-to-r from-amber-500 via-[#00F5D4] to-amber-500 rounded-b-lg opacity-90" />

            {/* Teacup Side Handle (Right Side) */}
            <div className="absolute -right-7 top-24 w-10 h-28 border-[6px] border-[#4E3427] rounded-r-3xl border-l-0 bg-[#1C120E]/40 pointer-events-none shadow-md" />
            
            {/* Tea Bag String & Table Tag (Pinned over Rim) */}
            <div className="absolute -top-3 left-6 z-20 flex flex-col items-center">
              <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 to-amber-600 shadow-xs" />
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[11px] px-3 py-1 rounded-xl shadow-lg border border-amber-300 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-stone-950" />
                <span>{table.number}</span>
              </div>
            </div>

            {/* Teacup Brand Header */}
            <div className="mt-3 mb-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl bg-[#281A15] border border-[#4E3427] flex items-center justify-center p-1 shrink-0">
                  <img src="/logo.png" alt="TeaWala Logo" className="h-5 w-auto object-contain" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-glow-green font-black text-lg tracking-tight">tea</span>
                  <span className="text-glow-white font-black text-lg tracking-tight">wala</span>
                </div>
              </div>
            </div>

            {/* QR Code Container inside Teacup Body */}
            <div className="bg-white rounded-2xl p-3 border-2 border-stone-800 shadow-inner my-3 max-w-[210px] mx-auto">
              {isLoading ? (
                <div className="w-44 h-44 mx-auto bg-stone-100 rounded-xl flex flex-col items-center justify-center text-stone-500 text-xs font-bold gap-2 animate-pulse">
                  <Coffee className="w-8 h-8 text-amber-600 animate-bounce" />
                  <span>Brewing QR Code...</span>
                </div>
              ) : (
                <div className="w-44 h-44 mx-auto relative bg-white p-1 rounded-lg">
                  <img src={qrDataUrl} alt={`QR Code for ${table.number}`} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Call To Action Footer inside Teacup */}
            <div className="mt-3 text-center space-y-0.5">
              <p className="text-xs font-black text-stone-100 uppercase tracking-wide flex items-center justify-center gap-1">
                <span>Scan to View Menu & Order</span>
              </p>
              <p className="text-[10px] text-stone-400 font-semibold">
                No App Download Required • Smart Table QR
              </p>
            </div>

            {/* Teacup Saucer Base (Bottom Tray Shadow Graphic) */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-3.5 bg-gradient-to-r from-amber-900/60 via-[#4E3427] to-amber-900/60 rounded-full border border-[#5E3E30] shadow-md" />
          </div>
        </div>

        {/* Action Controls (Hidden when printing) */}
        <div className="flex items-center justify-center gap-3 mt-8 no-print">
          <Button variant="outline" size="sm" onClick={() => window.open(menuUrl, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Open Menu Link
          </Button>

          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print Teacup QR Standee
          </Button>
        </div>
      </div>
    </Modal>
  );
};
