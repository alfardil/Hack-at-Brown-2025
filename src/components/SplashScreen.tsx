import "../App.css";

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400 text-center">
      {/* Rolling Yarn Ball Animation */}
      <div className="relative w-24 h-24 overflow-hidden">
        <div className="w-20 h-20 bg-red-500 rounded-full animate-bounce"></div>
      </div>

      {/* Arcade-Style Text */}
      <div className="text-4xl mt-6 font-arcade">W4 LAB</div>
      <div className="text-xl mt-2 font-arcade">hack@brown-2025</div>
    </div>
  );
};

export default SplashScreen;
