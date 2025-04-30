"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
      onFinish();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
        >
          <motion.h1
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -200, opacity: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: "easeInOut" }}
            className="text-4xl font-bold text-gray-800 relative"
          >
            Ben Santana
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-full w-1 h-1 bg-gray-600 rounded-full"
                style={{ translateX: "-50%" }}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{
                  y: [0, 10, 30, 50, 70],
                  scale: [1, 0.9, 0.6, 0.3, 0],
                  opacity: [1, 0.8, 0.5, 0.2, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: 1.2 + i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}