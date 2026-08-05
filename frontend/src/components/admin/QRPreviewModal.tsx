import React, { useEffect, useState } from 'react';
import type { TableInfo, CafeInfo } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Printer, Download, ExternalLink } from 'lucide-react';

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
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center printable-qr-modal">
        {/* Printable Card Area */}
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-8 max-w-sm mx-auto shadow-xl my-2">
          <div className="mb-4">
            <h2 className="text-xl font-black uppercase tracking-wider text-stone-900">
              {cafe?.name || 'MY CAFE'}
            </h2>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">Digital Menu & Ordering</p>
          </div>

          <div className="inline-block bg-amber-600 text-white text-base font-extrabold px-6 py-2 rounded-2xl mb-6 shadow-sm">
            {table.number}
          </div>

          {isLoading ? (
            <div className="w-48 h-48 mx-auto bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 text-xs font-semibold animate-pulse">
              Generating QR Code...
            </div>
          ) : (
            <div className="w-52 h-52 mx-auto bg-white p-3 border border-stone-200 rounded-2xl shadow-inner mb-6">
              <img src={qrDataUrl} alt={`QR for ${table.number}`} className="w-full h-full object-contain" />
            </div>
          )}

          <p className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
            Scan to View Menu & Order
          </p>
          <p className="text-[10px] text-stone-400 font-medium">No App Download Required</p>
        </div>

        {/* Action Controls (Hidden when printing) */}
        <div className="flex items-center justify-center gap-3 mt-6 no-print">
          <Button variant="outline" size="sm" onClick={() => window.open(menuUrl, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Open Menu Link
          </Button>

          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print QR Layout
          </Button>
        </div>
      </div>
    </Modal>
  );
};
