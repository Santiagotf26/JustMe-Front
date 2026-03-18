import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import './VerificationBanner.css';

interface Props {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export function VerificationBanner({ status, rejectionReason }: Props) {
    if (status === 'none' || status === 'approved') return null;

    const config = {
        pending: {
            icon: <Clock size={20} />,
            title: 'Verificación en proceso',
            message: 'Tu solicitud para ser profesional está siendo revisada. Te notificaremos cuando sea aprobada.',
            className: 'vb-pending',
        },
        rejected: {
            icon: <XCircle size={20} />,
            title: 'Verificación rechazada',
            message: rejectionReason || 'Tu solicitud no fue aprobada. Por favor contacta soporte para más información.',
            className: 'vb-rejected',
        },
    };

    const c = config[status];

    return (
        <motion.div
            className={`verification-banner ${c.className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {c.icon}
            <div className="vb-content">
                <strong>{c.title}</strong>
                <p>{c.message}</p>
            </div>
        </motion.div>
    );
}
