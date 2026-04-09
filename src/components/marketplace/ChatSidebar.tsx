'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { motion } from 'framer-motion';
import { Message } from '@/store/useGeolandStore';
import { Menu, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
    messages: Message[];
    onSendMessage?: (content: string) => void;
    isLoading?: boolean;
}

export function ChatSidebar({ messages, onSendMessage, isLoading }: ChatSidebarProps) {
    const { chatSidebarOpen, setChatSidebarOpen } = useGeolandStore();
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim() && onSendMessage) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed left-0 top-0 h-full z-40 bg-white/10 backdrop-blur-lg border-r border-white/10 flex flex-col transition-all duration-300 ${
                chatSidebarOpen ? 'w-[30%]' : 'w-[60px]'
            }`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
                className="flex items-center justify-center w-full h-16 hover:bg-white/5 transition-colors flex-shrink-0 border-b border-white/10"
                title={chatSidebarOpen ? 'Cerrar chat' : 'Abrir chat'}
            >
                <Menu size={20} className="text-white/70" />
            </button>

            {/* Chat Content (visible solo cuando abierto) */}
            {chatSidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {messages.length === 0 ? (
                            <div className="text-center text-white/40 text-sm mt-8">
                                <p>No hay mensajes</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-[#5a4282] text-white'
                                                : 'bg-white/10 text-white/80'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2 bg-[#5a4282] text-white rounded-lg hover:bg-[#5a4282]/80 disabled:opacity-50 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
