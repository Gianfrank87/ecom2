import React, { useState } from 'react';
import { CheckCircle2, Download, FileUp } from 'lucide-react';
import { api } from '../services/api';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ReceiptUpload({ orderId, token, hasReceipt = false, allowUpload = true, receiptStatus = 'missing', onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const receiptWasSent = hasReceipt || uploaded;
  const canUpload = allowUpload && !uploaded;
  const effectiveStatus = uploaded ? 'review' : receiptStatus;
  const statusClasses = {
    missing: 'border-red-300 bg-red-50/70',
    rejected: 'border-red-300 bg-red-50/70',
    review: 'border-amber-300 bg-amber-50/70',
    approved: 'border-emerald-300 bg-emerald-50/70',
  }[effectiveStatus] || 'border-gray-200 bg-gray-50';
  const confirmationClasses = effectiveStatus === 'approved'
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
    : 'border-amber-300 bg-amber-50 text-amber-900';

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setError('');
    setUploaded(false);
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.has(nextFile.type)) {
      setFile(null);
      setError('Elegí una imagen JPEG/PNG o un PDF.');
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError('El comprobante no puede superar los 5 MB.');
      return;
    }
    setFile(nextFile);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || uploading) return;
    setUploading(true);
    setError('');
    try {
      await api.uploadOrderReceipt(orderId, file, token);
      setUploaded(true);
      setFile(null);
      event.target.reset();
      onUploaded?.();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      const blob = await api.downloadOrderReceipt(orderId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante-pedido-${orderId}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`rounded-none border p-4 space-y-3 ${statusClasses}`}>
      <div className="flex items-start gap-3">
        <FileUp className="w-5 h-5 shrink-0 text-[#352820] mt-0.5" />
        <div>
          <h3 className="text-sm font-extrabold text-gray-900">Comprobante de transferencia</h3>
          <p className="text-xs text-gray-600 mt-1">
            {effectiveStatus === 'approved'
              ? 'El pago fue aprobado correctamente.'
              : receiptWasSent
                ? 'El archivo fue recibido y está pendiente de revisión.'
                : 'Subí una imagen JPEG/PNG o PDF de hasta 5 MB.'}
          </p>
        </div>
      </div>
      {receiptWasSent && (
        <div className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-none border px-3 py-2 ${confirmationClasses}`}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> {effectiveStatus === 'approved' ? 'Pago aprobado' : 'Comprobante enviado'}
          </span>
          <button type="button" onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#352820] hover:text-[#4b382b] disabled:opacity-50 cursor-pointer" title="Descargar comprobante">
            <Download className="w-4 h-4" /> {downloading ? 'Descargando...' : 'Descargar'}
          </button>
        </div>
      )}
      {canUpload && (
        <form onSubmit={handleUpload} className="space-y-2">
          <input type="file" name="comprobante" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-none file:border-0 file:bg-[#352820] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#f0dc78] hover:file:bg-[#4b382b]" />
          <button type="submit" disabled={!file || uploading} className="w-full rounded-none bg-[#352820] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-[#f0dc78] hover:bg-[#4b382b] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 cursor-pointer">
            {uploading ? 'Subiendo...' : 'Subir comprobante'}
          </button>
        </form>
      )}
      {uploaded && <p className="text-xs font-bold text-emerald-700">Comprobante recibido. Queda pendiente de revisión.</p>}
      {error && <p className="text-xs font-bold text-red-700">{error}</p>}
    </div>
  );
}
