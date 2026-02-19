'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function DocumentUploader() {
  const router = useRouter();
  const { setDocument } = useOrderStore();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setUploadState('uploading');
      setProgress(0);
      setErrorMessage('');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      try {
        const formData = new FormData();
        formData.append('file', file);

        setUploadState('processing');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du traitement');
        }

        if (!data.valid) {
          setUploadState('error');
          setErrorMessage(
            data.reason ||
              'Ce document ne peut pas être imprimé. Notre plateforme accepte uniquement les documents d\'au moins 10 pages.'
          );
          return;
        }

        setUploadState('success');
        setDocument({
          name: data.fileName,
          pageCount: data.pageCount,
          hasIssues: false,
          savedFileName: data.savedFileName,
        });

        setTimeout(() => {
          router.push('/verification');
        }, 800);
      } catch (err) {
        clearInterval(progressInterval);
        setUploadState('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    },
    [router, setDocument]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          setErrorMessage('Le fichier est trop volumineux. La taille maximale est 50 Mo.');
        } else if (error.code === 'file-invalid-type') {
          setErrorMessage('Seuls les fichiers PDF et Word (.docx) sont acceptés.');
        } else {
          setErrorMessage('Fichier invalide. Veuillez réessayer.');
        }
        setUploadState('error');
        return;
      }

      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxSize: 50 * 1024 * 1024,
    maxFiles: 1,
    disabled: uploadState === 'uploading' || uploadState === 'processing' || uploadState === 'success',
  });

  const isLoading = uploadState === 'uploading' || uploadState === 'processing';

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 cursor-pointer',
          'flex flex-col items-center justify-center gap-4 min-h-[200px]',
          isDragActive && !isDragReject && 'border-blue-500 bg-blue-50 scale-[1.01]',
          isDragReject && 'border-red-400 bg-red-50',
          uploadState === 'error' && 'border-red-300 bg-red-50',
          uploadState === 'success' && 'border-green-400 bg-green-50',
          !isDragActive && uploadState === 'idle' && 'border-gray-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/40',
          isLoading && 'border-blue-300 bg-blue-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-blue-700">
              {uploadState === 'uploading' ? 'Envoi en cours...' : 'Analyse du document...'}
            </p>
            {selectedFile && (
              <p className="text-xs text-gray-500 truncate max-w-xs">{selectedFile.name}</p>
            )}
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-blue-500">{Math.round(Math.min(progress, 100))}%</p>
          </div>
        ) : uploadState === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-green-700">Document accepté !</p>
            <p className="text-xs text-green-600">Redirection en cours...</p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                isDragActive && !isDragReject ? 'bg-blue-100' : 'bg-blue-50'
              )}
            >
              {isDragActive && !isDragReject ? (
                <Upload className="w-7 h-7 text-blue-600" />
              ) : (
                <FileText className="w-7 h-7 text-blue-400" />
              )}
            </div>

            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-1">
                {isDragActive && !isDragReject
                  ? 'Relâchez pour déposer'
                  : isDragReject
                  ? 'Ce type de fichier n\'est pas accepté'
                  : 'Glissez votre PDF ou Word ici'}
              </p>
              <p className="text-sm text-gray-400">
                ou{' '}
                <span className="text-blue-600 font-medium underline underline-offset-2">
                  parcourez vos fichiers
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['PDF · Word (.docx)', 'Max 50 Mo', 'Min 10 pages'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-400"
                >
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {uploadState === 'error' && errorMessage && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Document non accepté</p>
            <p className="text-sm text-red-600 mt-0.5">{errorMessage}</p>
            <button
              onClick={() => {
                setUploadState('idle');
                setErrorMessage('');
                setSelectedFile(null);
                setProgress(0);
              }}
              className="mt-2 text-xs text-red-500 underline hover:text-red-700"
            >
              Essayer avec un autre fichier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
