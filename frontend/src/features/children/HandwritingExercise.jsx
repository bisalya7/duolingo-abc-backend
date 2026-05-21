import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function HandwritingExercise({ exercise, onComplete, status }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100% покрытия контура
  const [showGuide, setShowGuide] = useState(true);

  const c = typeof exercise.content === 'string'
    ? (() => { try { return JSON.parse(exercise.content); } catch { return {}; } })()
    : exercise.content ?? {};

  const letter = c.letter || 'А';
  const guideColor = c.guide_color || '#e5e5e5';
  const traceColor = c.trace_color || '#1cb0f6';

  // Размер canvas (логический и физический для retina)
  const SIZE = 320;
  const DPR = window.devicePixelRatio || 1;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(DPR, DPR);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawGuide(ctx);
  }, []);

  const drawGuide = (ctx) => {
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Фон
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Линии для письма (как в тетради)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    for (let y of [80, 160, 240]) {
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(300, y); ctx.stroke();
    }

    // Контур буквы (пунктир)
    ctx.font = 'bold 180px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = guideColor;
    ctx.lineWidth = 6;
    ctx.setLineDash([12, 12]);
    ctx.strokeText(letter, SIZE / 2, SIZE / 2 + 10);
    ctx.setLineDash([]);

    // Подсказка анимации (если включена)
    if (showGuide) {
      ctx.fillStyle = guideColor;
      ctx.globalAlpha = 0.3;
      ctx.fillText(letter, SIZE / 2, SIZE / 2 + 10);
      ctx.globalAlpha = 1.0;
    }
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (SIZE / rect.width),
      y: (clientY - rect.top) * (SIZE / rect.height),
    };
  };

  const startDraw = (e) => {
    if (status !== 'idle') return;
    e.preventDefault();
    setIsDrawing(true);
    setShowGuide(false);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || status !== 'idle') return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = traceColor;
    ctx.lineWidth = 14;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();

    // Упрощённая проверка: считаем пиксели traceColor на canvas
    // Для production можно сделать hit-test по path буквы, но для детей 3–8
    // достаточно проверки, что они что-то нарисовали в центральной зоне
    const imageData = ctx.getImageData(0, 0, SIZE * DPR, SIZE * DPR).data;
    let drawnPixels = 0;
    const targetColor = hexToRgb(traceColor);

    for (let i = 0; i < imageData.length; i += 4 * 10) { // сэмплируем каждый 10й пиксель для скорости
      if (
        Math.abs(imageData[i] - targetColor.r) < 40 &&
        Math.abs(imageData[i + 1] - targetColor.g) < 40 &&
        Math.abs(imageData[i + 2] - targetColor.b) < 40
      ) {
        drawnPixels++;
      }
    }

    // Порог: если нарисовано достаточно много в центральной области — ок
    const threshold = 300; // подбери под размер буквы
    const coverage = Math.min(100, Math.floor((drawnPixels / threshold) * 100));
    setProgress(coverage);

    if (coverage >= 60) {
      onComplete(letter); // считаем правильным
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    drawGuide(ctx);
    setProgress(0);
    setShowGuide(true);
  };

  useEffect(() => { initCanvas(); }, [initCanvas]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto select-none">
      <h2 className="text-2xl font-black text-[#3c3c3c] text-center">
        {c.question || `Обведи букву ${letter}`}
      </h2>

      <div className="relative rounded-3xl border-4 border-[#1cb0f6]/20 bg-white p-2 shadow-xl">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="rounded-2xl cursor-crosshair touch-none"
          style={{ width: SIZE, height: SIZE }}
        />

        {/* Индикатор прогресса */}
        <div className="absolute bottom-4 left-4 right-4 h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#58cc02] rounded-full"
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Кнопка очистки */}
        <button
          onClick={clearCanvas}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur border-2 border-gray-100 p-2 rounded-xl text-gray-400 hover:text-[#1cb0f6] transition-colors"
        >
          ↺
        </button>
      </div>

      <p className="text-sm font-bold text-gray-400">
        {progress < 60 ? 'Веди пальцем или мышкой по букве!' : 'Отлично! Буква готова! 🎉'}
      </p>
    </div>
  );
}