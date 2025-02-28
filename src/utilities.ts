import { AnnotatedPrediction } from '@tensorflow-models/handpose';

// El işaretlerini çizme fonksiyonu
export const drawHand = (predictions: AnnotatedPrediction[], ctx: CanvasRenderingContext2D) => {
  // El tespit edildiyse
  if (predictions.length > 0) {
    // Her el için
    predictions.forEach((prediction) => {
      // Parmak eklemleri
      const landmarks = prediction.landmarks;
      
      // Parmak eklemleri arasındaki bağlantıları çiz
      // Başparmak
      drawConnectors(ctx, landmarks, [0, 1, 2, 3, 4], 'rgb(255, 0, 0)', 5);
      
      // İşaret parmağı
      drawConnectors(ctx, landmarks, [0, 5, 6, 7, 8], 'rgb(0, 255, 0)', 5);
      
      // Orta parmak
      drawConnectors(ctx, landmarks, [0, 9, 10, 11, 12], 'rgb(0, 0, 255)', 5);
      
      // Yüzük parmağı
      drawConnectors(ctx, landmarks, [0, 13, 14, 15, 16], 'rgb(255, 255, 0)', 5);
      
      // Serçe parmak
      drawConnectors(ctx, landmarks, [0, 17, 18, 19, 20], 'rgb(255, 0, 255)', 5);
      
      // Avuç içi
      drawConnectors(ctx, landmarks, [0, 5, 9, 13, 17, 0], 'rgb(255, 255, 255)', 5);
      
      // Her eklem noktasını çiz
      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i][0];
        const y = landmarks[i][1];
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgb(0, 255, 255)';
        ctx.fill();
      }
    });
  }
};

// İki nokta arasında çizgi çizme fonksiyonu
const drawConnectors = (
  ctx: CanvasRenderingContext2D,
  landmarks: number[][],
  connectors: number[],
  color: string,
  lineWidth: number
) => {
  const canvas = ctx.canvas;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  for (let i = 0; i < connectors.length - 1; i++) {
    const [x1, y1] = landmarks[connectors[i]];
    const [x2, y2] = landmarks[connectors[i + 1]];
    
    if (
      x1 < 0 || x1 > canvas.width || y1 < 0 || y1 > canvas.height ||
      x2 < 0 || x2 > canvas.width || y2 < 0 || y2 > canvas.height
    ) {
      continue;
    }
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
};