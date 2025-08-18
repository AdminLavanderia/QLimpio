

import React, { useState, useEffect, useRef } from 'react';
import { XIcon, TrashIcon } from './icons';

interface CameraModalProps {
    onClose: () => void;
    onSave: (photos: string[]) => void;
    initialPhotos: string[];
}

export const CameraModal: React.FC<CameraModalProps> = ({ onClose, onSave, initialPhotos }) => {
    const [photos, setPhotos] = useState<string[]>(initialPhotos);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    setIsCameraOn(true);
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                alert("No se pudo acceder a la cámara. Asegúrate de haber dado los permisos necesarios en el navegador.");
                onClose();
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onClose]);

    const takePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setPhotos(prev => [...prev, dataUrl]);
        }
    };

    const deletePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(photos);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-display">Capturar Fotos de Prendas</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-gray-900 mb-4"></video>
                        <button onClick={takePhoto} disabled={!isCameraOn} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                            Tomar Foto
                        </button>
                    </div>
                    <div className="border-l pl-6">
                        <h3 className="font-semibold mb-2">Fotos Capturadas ({photos.length})</h3>
                        {photos.length === 0 ? (
                            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                                <p className="text-sm text-text-secondary text-center p-4">Apunta con la cámara y presiona "Tomar Foto".</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-2">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <img src={photo} alt={`Prenda ${index + 1}`} className="w-full h-24 object-cover rounded"/>
                                        <button onClick={() => deletePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon className="w-3 h-3"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
                 <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-white border mr-2 hover:bg-gray-100">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-blue-600">
                        Guardar {photos.length > 0 ? `${photos.length} Foto(s)` : 'Fotos'}
                    </button>
                </footer>
            </div>
        </div>
    );
};