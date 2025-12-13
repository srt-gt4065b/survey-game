import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function useLevelUpEffect(level) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (level > 1) {
      setShowConfetti(true);

      toast.success(`🎉 Level ${level} reached!`, {
        duration: 3000,
        position: "top-center",
      });

      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [level]);

  return showConfetti;
}
