"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

export type Point = { x: number; y: number };
export type Stroke = Point[];

export const PAD_SIZE = 512;

export type DrawPadHandle = {
  /** Strokes in pad coordinates (0..PAD_SIZE). Feed these to the recogniser. */
  getStrokes: () => Stroke[];
  clear: () => void;
  undo: () => void;
  /** PNG data URL of the drawing, for saving to the child's gallery. */
  toDataURL: () => string;
};

type Props = {
  /** Fires after every completed stroke — the recogniser re-guesses on this. */
  onStrokesChange?: (strokes: Stroke[]) => void;
  disabled?: boolean;
  ink?: string;
  background?: string;
};

/**
 * A plain stroke-capture canvas.
 *
 * Deliberately unstyled compared with the rest of DoodleLab: the model was
 * trained on thin black doodles on white, so a glow pen or a galaxy background
 * here would wreck recognition. The art supplies belong in the drawing games,
 * not in the robot's eye.
 */
const DrawPad = forwardRef<DrawPadHandle, Props>(function DrawPad(
  { onStrokesChange, disabled = false, ink = "#131A2A", background = "#FFFFFF" },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const [, force] = useState(0);

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, PAD_SIZE, PAD_SIZE);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (!stroke.length) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      // A single tap still has to leave a mark, so close the path on itself.
      if (stroke.length === 1) ctx.lineTo(stroke[0].x + 0.01, stroke[0].y);
      else for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, [ink, background]);

  useEffect(repaint, [repaint]);

  const posOf = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * PAD_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * PAD_SIZE,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokesRef.current = [...strokesRef.current, [posOf(e)]];
    repaint();
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || disabled) return;
    const strokes = strokesRef.current;
    strokes[strokes.length - 1].push(posOf(e));
    repaint();
  };

  const onUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onStrokesChange?.(strokesRef.current);
    force(n => n + 1);
  };

  useImperativeHandle(ref, () => ({
    getStrokes: () => strokesRef.current,
    clear: () => {
      strokesRef.current = [];
      repaint();
      onStrokesChange?.([]);
      force(n => n + 1);
    },
    undo: () => {
      strokesRef.current = strokesRef.current.slice(0, -1);
      repaint();
      onStrokesChange?.(strokesRef.current);
      force(n => n + 1);
    },
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
  }));

  return (
    <canvas
      ref={canvasRef}
      width={PAD_SIZE}
      height={PAD_SIZE}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="block w-full h-auto rounded-2xl border border-line"
      style={{ touchAction: "none", cursor: disabled ? "default" : "crosshair", background }}
    />
  );
});

export default DrawPad;
