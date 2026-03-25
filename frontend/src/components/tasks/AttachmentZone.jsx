import React, { useState } from 'react';
import { Paperclip, X, File, Image, FileText, Download, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'sonner';

const AttachmentZone = ({ taskId, attachments = [], onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic size limit (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large (max 2MB)");
            return;
        }

        setIsUploading(true);
        try {
            // In a real app, you'd upload to S3/Cloudinary first.
            // For now, we'll simulate an upload by creating a local object URL or placeholder
            // and saving the metadata to the task.

            // Simulation: 
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const mockUrl = reader.result; // This is a base64 string
                const attachmentData = {
                    name: file.name,
                    url: mockUrl,
                    fileType: file.type,
                    size: file.size
                };

                const res = await api.post(`/tasks/${taskId}/attachments`, attachmentData);
                toast.success("File attached!");
                if (onUpdate) onUpdate(res.data);
            };
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const deleteAttachment = async (attachmentId) => {
        try {
            const res = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
            toast.success("Attachment removed");
            if (onUpdate) onUpdate(res.data);
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <Image size={16} />;
        if (type.includes('pdf')) return <FileText size={16} />;
        return <File size={16} />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Attachments</h3>
                <label className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Paperclip size={14} />}
                    Attach File
                    <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <AnimatePresence>
                    {attachments.map((file) => (
                        <motion.div
                            key={file.id || file._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl group transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                                    {getFileIcon(file.fileType)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={file.url}
                                    download={file.name}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                >
                                    <Download size={14} />
                                </a>
                                <button
                                    onClick={() => deleteAttachment(file.id || file._id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {attachments.length === 0 && (
                    <div className="py-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-bold italic">
                        No files attached to this mission.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttachmentZone;
