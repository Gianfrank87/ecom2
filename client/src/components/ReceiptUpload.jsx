import React, { useState } from 'react';
import { CheckCircle2, Download, FileUp } from 'lucide-react';
import { api } from '../services/api';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ReceiptUpload({ orderId, token, hasReceipt = false, allowUpload = true, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

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
    <div className="rounded-none border border-amber-200 bg-amber-50/70 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <FileUp className="w-5 h-5 shrink-0 text-[#352820] mt-0.5" />
        <div>
          <h3 className="text-sm font-extrabold text-gray-900">Comprobante de transferencia</h3>
          <p className="text-xs text-gray-600 mt-1">Subí una imagen JPEG/PNG o PDF de hasta 5 MB.</p>
        </div>
      </div>
      {(hasReceipt || uploaded) && (
        <div className="flex items-center justify-between gap-3 rounded-none border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Comprobante enviado
          </span>
          <button type="button" onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#352820] hover:text-[#4b382b] disabled:opacity-50 cursor-pointer" title="Descargar comprobante">
            <Download className="w-4 h-4" /> {downloading ? 'Descargando...' : 'Descargar'}
          </button>
        </div>
      )}
      {allowUpload && (
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
