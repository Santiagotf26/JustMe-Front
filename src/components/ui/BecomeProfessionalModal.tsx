import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckSquare, AlertTriangle, Loader2, X, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { verificationService } from '../../services/verificationService';
import { useNotification } from '../../context/NotificationContext';
import './BecomeProfessionalModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BecomeProfessionalModal({ isOpen, onClose, onSuccess }: Props) {
    const { notify } = useNotification();
    const [step, setStep] = useState(0);
    const [accepted, setAccepted] = useState(false);
    const [certNumber, setCertNumber] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!accepted || !certNumber.trim()) return;
        setLoading(true);
        try {
            await verificationService.applyForProfessional({
                certificationNumber: certNumber.trim(),
                documents,
            });
            notify('success', '¡Solicitud enviada!', 'Tu solicitud para ser profesional está siendo revisada.');
            onSuccess();
            handleClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Error al enviar la solicitud. Intenta de nuevo.';
            notify('error', 'Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(0);
        setAccepted(false);
        setCertNumber('');
        setDocuments([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="">
            <div className="bpm-modal">
                <AnimatePresence mode="wait">
                    {/* Step 0: Confirmation */}
                    {step === 0 && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bpm-step"
                        >
                            <div className="bpm-icon-wrap">
                                <Shield size={40} />
                            </div>
                            <h2>Convertirme en Profesional</h2>
                            <p className="bpm-desc">
                                Para ofrecer tus servicios en JustMe, necesitas pasar por un proceso de verificación.
                                Esto garantiza la seguridad y confianza de nuestros usuarios.
                            </p>

                            <div className="bpm-warning">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>Aviso Legal</strong>
                                    <p>
                                        Al continuar, declaras que tienes las certificaciones y habilitaciones legales
                                        necesarias para ofrecer servicios de belleza y bienestar. JustMe no se
                                        responsabiliza por servicios prestados sin la debida autorización.
                                    </p>
                                </div>
                            </div>

                            <label className="bpm-checkbox">
                                <input
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <span>
                                    Certifico que cuento con las credenciales y permisos necesarios para ejercer
                                    como profesional de belleza y bienestar.
                                </span>
                            </label>

                            <Button
                                onClick={() => setStep(1)}
                                disabled={!accepted}
                                size="lg"
                                className="bpm-continue-btn"
                            >
                                Continuar
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 1: Documents & Certification */}
                    {step === 1 && (
                        <motion.div
                            key="docs"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bpm-step"
                        >
                            <div className="bpm-icon-wrap">
                                <FileText size={40} />
                            </div>
                            <h2>Documentación</h2>
                            <p className="bpm-desc">
                                Sube tus documentos de certificación y proporciona tu número de certificación profesional.
                            </p>

                            <div className="bpm-form-group">
                                <label>Número de Certificación *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: CERT-2024-00123"
                                    value={certNumber}
                                    onChange={(e) => setCertNumber(e.target.value)}
                                    className="bpm-input"
                                />
                            </div>

                            <div className="bpm-form-group">
                                <label>Documentos (PDF o imagen)</label>
                                <div className="bpm-upload-area">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleFileChange}
                                        id="bpm-file-input"
                                        className="bpm-file-input"
                                    />
                                    <label htmlFor="bpm-file-input" className="bpm-upload-label">
                                        <Upload size={24} />
                                        <span>Click para subir archivos</span>
                                        <span className="bpm-upload-hint">PDF, JPG o PNG (máx. 10MB)</span>
                                    </label>
                                </div>
                                {documents.length > 0 && (
                                    <div className="bpm-file-list">
                                        {documents.map((f, i) => (
                                            <div key={i} className="bpm-file-item">
                                                <FileText size={14} />
                                                <span>{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bpm-actions">
                                <Button variant="ghost" onClick={() => setStep(0)}>Atrás</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!certNumber.trim() || loading}
                                    loading={loading}
                                    size="lg"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
}
