import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { drawHand } from './utilities';
import { SignLanguageRecognizer } from './signLanguageRecognizer';
import { Camera, Volume2, VolumeX, Mic, MicOff, Book, X, ChevronRight } from 'lucide-react';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [recognizer, setRecognizer] = useState<SignLanguageRecognizer | null>(null);
  const [prediction, setPrediction] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<'kelime' | 'harf'>('kelime');

  // Modeli yükle
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      console.log('TensorFlow.js yüklendi');
      
      const handModel = await handpose.load();
      console.log('Handpose modeli yüklendi');
      
      setModel(handModel);
      
      const signRecognizer = new SignLanguageRecognizer();
      await signRecognizer.initialize();
      setRecognizer(signRecognizer);
      
      setIsLoading(false);
    };
    
    loadModel();
  }, []);

  // El hareketlerini algıla
  useEffect(() => {
    const detectHands = async () => {
      if (
        model && 
        recognizer && 
        webcamRef.current && 
        webcamRef.current.video && 
        webcamRef.current.video.readyState === 4 &&
        canvasRef.current &&
        isCameraOn
      ) {
        // Video boyutlarını al
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Canvas boyutlarını ayarla
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // El tespiti yap
        const hand = await model.estimateHands(video);
        
        // Canvas'a eli çiz
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          drawHand(hand, ctx);
        }
        
        // İşaret dilini tanı
        if (hand.length > 0) {
          const result = recognizer.recognize(hand[0].landmarks);
          if (result && result !== prediction) {
            setPrediction(result);
            
            // Geçmişe ekle
            setHistory(prev => {
              const newHistory = [...prev, result];
              if (newHistory.length > 10) {
                return newHistory.slice(newHistory.length - 10);
              }
              return newHistory;
            });
            
            // Sesli okuma
            if (isSpeechEnabled) {
              speak(result);
            }
          }
        }
      }
    };

    const interval = setInterval(detectHands, 100);
    return () => clearInterval(interval);
  }, [model, recognizer, prediction, isCameraOn, isSpeechEnabled]);

  // Sesli okuma fonksiyonu
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Kamera durumunu değiştir
  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  // Ses durumunu değiştir
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  // Mikrofon durumunu değiştir
  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  // Çekmeceyi aç/kapat
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    setSelectedSign(null);
  };

  // İşaret seç
  const selectSign = (sign: string) => {
    setSelectedSign(sign);
  };

  // Geçmişi temizle
  const clearHistory = () => {
    setHistory([]);
  };

  // İşaret rehberi verileri
  const signGuideData = [
    {
      name: 'Merhaba',
      type: 'kelime',
      description: 'Tüm parmaklar açık, avuç içi karşıya bakacak şekilde el sallanır.',
      imageUrl: 'https://i.ibb.co/TMJNTyCL/a2212f94-36a7-4408-a731-31c1a0f30927.webp',
      steps: [
        'Elinizi göğüs hizasında tutun',
        'Tüm parmaklarınızı açın',
        'Avuç içiniz karşıya bakacak şekilde',
        'Elinizi sağa sola hafifçe sallayın'
      ]
    },
    {
      name: 'Teşekkürler',
      type: 'kelime',
      description: 'Parmaklar düz, el ağıza doğru götürülür ve öne doğru hareket ettirilir.',
      imageUrl: 'https://i.ibb.co/Jnk9tZq/tesekkurler-isaret-dili.jpg',
      steps: [
        'Sağ elinizin parmaklarını düz tutun',
        'Elinizi ağzınıza doğru götürün',
        'Dudaklarınıza dokunun',
        'Elinizi öne doğru hareket ettirin'
      ]
    },
    {
      name: 'Evet',
      type: 'kelime',
      description: 'Yumruk yapılmış, başparmak yukarı bakacak şekilde tutulur.',
      imageUrl: 'https://i.ibb.co/Jnk9tZq/evet-isaret-dili.jpg',
      steps: [
        'Elinizi yumruk yapın',
        'Başparmağınızı yukarı doğru kaldırın',
        'Elinizi hafifçe yukarı aşağı hareket ettirin'
      ]
    },
    {
      name: 'Hayır',
      type: 'kelime',
      description: 'İşaret parmağı açık, diğer parmaklar kapalı, sağa sola sallanır.',
      imageUrl: 'https://i.ibb.co/Jq9Hnzw/hayir-isaret-dili.jpg',
      steps: [
        'İşaret parmağınızı açın',
        'Diğer parmaklarınızı kapatın',
        'İşaret parmağınızı sağa sola sallayın'
      ]
    },
    {
      name: 'Lütfen',
      type: 'kelime',
      description: 'Avuç içi yukarı, parmaklar hafif kıvrık şekilde tutulur.',
      imageUrl: 'https://i.ibb.co/Lk3QLSM/lutfen-isaret-dili.jpg',
      steps: [
        'Avuç içiniz yukarı bakacak şekilde elinizi tutun',
        'Parmaklarınızı hafifçe kıvırın',
        'Elinizi hafifçe yukarı kaldırın'
      ]
    },
    {
      name: 'Yardım',
      type: 'kelime',
      description: 'İşaret parmağı ve başparmak açık, diğer parmaklar kapalı.',
      imageUrl: 'https://i.ibb.co/Jj1Hnzw/yardim-isaret-dili.jpg',
      steps: [
        'İşaret parmağınızı ve başparmağınızı açın',
        'Diğer parmaklarınızı kapatın',
        'Elinizi göğüs hizasında tutun',
        'Elinizi hafifçe ileri geri hareket ettirin'
      ]
    },
    {
      name: 'Su',
      type: 'kelime',
      description: 'Başparmak, işaret parmağı ve orta parmak açık, diğerleri kapalı.',
      imageUrl: 'https://i.ibb.co/Jj1Hnzw/su-isaret-dili.jpg',
      steps: [
        'Başparmak, işaret parmağı ve orta parmağınızı açın',
        'Diğer parmaklarınızı kapatın',
        'Elinizi ağzınıza doğru götürün'
      ]
    },
    {
      name: 'Acıktım',
      type: 'kelime',
      description: 'El ağıza doğru hareket ettirilir, parmaklar hafif kıvrık.',
      imageUrl: 'https://i.ibb.co/Jj1Hnzw/aciktim-isaret-dili.jpg',
      steps: [
        'Parmaklarınızı hafifçe kıvırın',
        'Elinizi ağzınıza doğru götürün',
        'Bu hareketi birkaç kez tekrarlayın'
      ]
    },
    {
      name: 'Nasılsın',
      type: 'kelime',
      description: 'İşaret parmağı ve orta parmak açık, diğerleri kapalı.',
      imageUrl: 'https://i.ibb.co/Jj1Hnzw/nasilsin-isaret-dili.jpg',
      steps: [
        'İşaret parmağı ve orta parmağınızı açın',
        'Diğer parmaklarınızı kapatın',
        'Elinizi göğüs hizasında tutun',
        'Elinizi hafifçe sağa sola hareket ettirin'
      ]
    },
    {
      name: 'İyiyim',
      type: 'kelime',
      description: 'Başparmak yukarı, diğer parmaklar kapalı.',
      imageUrl: 'https://i.ibb.co/Jj1Hnzw/iyiyim-isaret-dili.jpg',
      steps: [
        'Elinizi yumruk yapın',
        'Başparmağınızı yukarı doğru kaldırın',
        'Elinizi göğüs hizasında tutun'
      ]
    },
    {
      name: 'A',
      type: 'harf',
      description: 'A harfi işareti.',
      imageUrl: 'link_to_a_image',
      steps: [
        'Elinizi yumruk yapın',
        'Başparmağınızı yukarı doğru kaldırın'
      ]
    }
  ];

  const filteredSigns = signGuideData.filter(sign => sign.type === selectedDataType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center p-4 relative">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">İşaret Dili Çevirici</h1>
      
      {/* Seçim arayüzü */}
      <div className="flex space-x-4 mb-4">
        <button onClick={() => setSelectedDataType('kelime')} className={`p-3 rounded ${selectedDataType === 'kelime' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>Kelime</button>
        <button onClick={() => setSelectedDataType('harf')} className={`p-3 rounded ${selectedDataType === 'harf' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>Harf</button>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-700">Modeller yükleniyor, lütfen bekleyin...</p>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-2xl mb-4">
            {isCameraOn && (
              <>
                <Webcam
                  ref={webcamRef}
                  className="w-full rounded-lg shadow-lg"
                  mirrored={true}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full z-10"
                />
              </>
            )}
            
            {!isCameraOn && (
              <div className="bg-gray-200 w-full h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Kamera kapalı</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Tanınan İşaret:</h2>
            <div className="bg-blue-50 p-4 rounded-lg min-h-16 flex items-center justify-center">
              <p className="text-2xl font-bold text-blue-700">{prediction || "Henüz bir işaret tanınmadı"}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Geçmiş:</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {history.length > 0 ? (
                <p className="text-lg text-gray-700">{history.join(' ')}</p>
              ) : (
                <p className="text-gray-500">Henüz bir işaret tanınmadı</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={clearHistory}
              className="flex items-center justify-center p-3 rounded-full bg-red-500 text-white"
            >
              Geçmişi Temizle
            </button>
            <button 
              onClick={toggleCamera}
              className={`flex items-center justify-center p-3 rounded-full ${isCameraOn ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              <Camera size={24} />
            </button>
            
            <button 
              onClick={toggleSpeech}
              className={`flex items-center justify-center p-3 rounded-full ${isSpeechEnabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {isSpeechEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            
            <button 
              onClick={toggleMic}
              className={`flex items-center justify-center p-3 rounded-full ${isMicOn ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            
            <button 
              onClick={toggleDrawer}
              className={`flex items-center justify-center p-3 rounded-full ${isDrawerOpen ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'}`}
            >
              <Book size={24} />
            </button>
          </div>
        </>
      )}
      
      {/* İşaret Dili Rehberi Çekmecesi */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out overflow-y-auto ${
          isDrawerOpen ? 'w-full md:w-96' : 'w-0'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-800">İşaret Dili Rehberi</h2>
            <button 
              onClick={toggleDrawer}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={24} className="text-gray-700" />
            </button>
          </div>
          
          {selectedSign ? (
            <div>
              <button 
                onClick={() => setSelectedSign(null)}
                className="flex items-center text-blue-600 mb-4"
              >
                <ChevronRight size={16} className="transform rotate-180 mr-1" />
                <span>Geri Dön</span>
              </button>
              
              {filteredSigns.filter(sign => sign.name === selectedSign).map((sign, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{sign.name}</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={sign.imageUrl} 
                      alt={`${sign.name} işareti`} 
                      className="w-full h-64 object-contain"
                    />
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Açıklama:</h4>
                    <p className="text-gray-700">{sign.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Nasıl Yapılır:</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      {sign.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSigns.map((sign, index) => (
                <div 
                  key={index}
                  onClick={() => selectSign(sign.name)}
                  className="bg-gray-50 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-800">{sign.name}</span>
                  <ChevronRight size={20} className="text-gray-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Karartma Arka Planı */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleDrawer}
        ></div>
      )}
      
      <footer className="mt-auto pt-6 text-center text-gray-600">
        <p>© 2025 İşaret Dili Çevirici - <a href="https://github.com/cgetiren/" target="_blank" className="text-blue-500">Can Getiren</a></p>
      </footer>
    </div>
  );
}

export default App;