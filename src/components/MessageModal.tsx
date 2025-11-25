"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Mail } from "lucide-react";

export default function MessageModal({ isOpen, onClose, message }: any) {
  if (!message) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* CARD */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{message.sender}</h2>
                {message.phone && (
                  <p className="text-gray-500 text-sm">{message.phone}</p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3">
                {/* Call button */}
                <button
                  onClick={() => window.location.href = `tel:${message.phone}`}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                >
                  <Phone size={20} />
                </button>

                {/* SMS button */}
                <button
                  onClick={() => window.location.href = `sms:${message.phone}`}
                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                >
                  <MessageCircle size={20} />
                </button>

                {/* Email button */}
                <button
                  onClick={() => window.location.href = `mailto:${message.email || ""}`}
                  className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition"
                >
                  <Mail size={20} />
                </button>
              </div>
            </div>

            {/* MESSAGE CONTENT */}
            <div className="text-gray-800 text-base leading-relaxed mb-6">
              {message.content}
            </div>

            {/* TIMESTAMP */}
            <p className="text-sm text-gray-500 mb-6">
              Reçu le {new Date(message.created_at).toLocaleString()}
            </p>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
