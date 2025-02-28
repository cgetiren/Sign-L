import * as fp from 'fingerpose';

// İşaret dili tanıyıcı sınıfı
export class SignLanguageRecognizer {
  private gestures: any[] = [];
  private gestureEstimator: any = null;

  // Sınıfı başlat
  async initialize() {
    // Türk İşaret Dili için bazı temel işaretleri tanımla
    this.addMerhaba();
    this.addTesekkurler();
    this.addEvet();
    this.addHayir();
    this.addLutfen();
    this.addYardim();
    this.addSu();
    this.addAciktim();
    this.addNasilsin();
    this.addIyiyim();
    
    // Gesture estimator oluştur
    this.gestureEstimator = new fp.GestureEstimator(this.gestures);
    
    console.log('İşaret dili tanıyıcı başlatıldı');
    return true;
  }

  // İşareti tanı
  recognize(landmarks: number[][]) {
    if (!this.gestureEstimator) {
      return null;
    }
    
    // Landmarks formatını fingerpose formatına dönüştür
    const formattedLandmarks = landmarks.map(([x, y, z]) => [x, y, z]);
    
    // İşareti tahmin et
    const predictions = this.gestureEstimator.estimate(formattedLandmarks, 8.0);
    
    if (predictions.gestures.length > 0) {
      // En yüksek skora sahip işareti bul
      const result = predictions.gestures.reduce((p: any, c: any) => {
        return (p.score > c.score) ? p : c;
      });
      
      return result.name;
    }
    
    return null;
  }

  // Merhaba işareti
  private addMerhaba() {
    const merhabaGesture = new fp.GestureDescription('Merhaba');
    
    // Başparmak açık
    merhabaGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    
    // Diğer parmaklar açık
    for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      merhabaGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    }
    
    this.gestures.push(merhabaGesture);
  }

  // Teşekkürler işareti
  private addTesekkurler() {
    const tesekkurlerGesture = new fp.GestureDescription('Teşekkürler');
    
    // Parmaklar düz, el ağıza doğru
    for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      tesekkurlerGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    }
    
    this.gestures.push(tesekkurlerGesture);
  }

  // Evet işareti
  private addEvet() {
    const evetGesture = new fp.GestureDescription('Evet');
    
    // Yumruk yapılmış, başparmak yukarı
    evetGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    
    for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      evetGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    }
    
    this.gestures.push(evetGesture);
  }

  // Hayır işareti
  private addHayir() {
    const hayirGesture = new fp.GestureDescription('Hayır');
    
    // İşaret parmağı sağa sola sallanır
    hayirGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
    
    for (let finger of [fp.Finger.Thumb, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      hayirGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    }
    
    this.gestures.push(hayirGesture);
  }

  // Lütfen işareti
  private addLutfen() {
    const lutfenGesture = new fp.GestureDescription('Lütfen');
    
    // Avuç içi yukarı, parmaklar hafif kıvrık
    for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      lutfenGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 1.0);
    }
    
    this.gestures.push(lutfenGesture);
  }

  // Yardım işareti
  private addYardim() {
    const yardimGesture = new fp.GestureDescription('Yardım');
    
    // Sağ el sol elin üzerine konur
    yardimGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
    yardimGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    
    for (let finger of [fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      yardimGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    }
    
    this.gestures.push(yardimGesture);
  }

  // Su işareti
  private addSu() {
    const suGesture = new fp.GestureDescription('Su');
    
    // Başparmak, işaret parmağı ve orta parmak açık, diğerleri kapalı
    for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle]) {
      suGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    }
    
    for (let finger of [fp.Finger.Ring, fp.Finger.Pinky]) {
      suGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    }
    
    this.gestures.push(suGesture);
  }

  // Acıktım işareti
  private addAciktim() {
    const aciktimGesture = new fp.GestureDescription('Acıktım');
    
    // El ağıza doğru hareket eder
    for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      aciktimGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 1.0);
    }
    
    this.gestures.push(aciktimGesture);
  }

  // Nasılsın işareti
  private addNasilsin() {
    const nasilsinGesture = new fp.GestureDescription('Nasılsın');
    
    // İşaret parmağı ve orta parmak açık, diğerleri kapalı
    for (let finger of [fp.Finger.Index, fp.Finger.Middle]) {
      nasilsinGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    }
    
    for (let finger of [fp.Finger.Thumb, fp.Finger.Ring, fp.Finger.Pinky]) {
      nasilsinGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    }
    
    this.gestures.push(nasilsinGesture);
  }

  // İyiyim işareti
  private addIyiyim() {
    const iyiyimGesture = new fp.GestureDescription('İyiyim');
    
    // Başparmak yukarı
    iyiyimGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    
    for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      iyiyimGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    }
    
    this.gestures.push(iyiyimGesture);
  }
}