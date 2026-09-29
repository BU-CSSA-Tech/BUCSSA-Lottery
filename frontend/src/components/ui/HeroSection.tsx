import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";
import { Button } from "@/components/ui/button";
import { GlassText } from "./glass-text";
import Image from "next/image";
import { getThemePack } from "@/lib/theme";

interface HeroSectionProps {
  currentPrize: string;
  playerCount: number;
  isEliminated?: boolean;
  onStartGame?: () => void;
}

const HeroSection = ({
  onStartGame,
}: HeroSectionProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      {/* 粒子背景效果 */}
      <ParticleBackground />

      {/* 主要内容区域 - 移动端优化布局 */}
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pb-24 pt-24 text-center sm:pb-28 sm:pt-28">
        <div className="fixed top-8 left-1/2 -translate-x-1/2 block md:hidden sm:top-12">
          <Image src="/bucssalogo.png" alt="logo" width={150} height={150} className="h-auto w-20 sm:w-32" />
        </div>

        {/* 标题和开始按钮居中，和底部规则分开 */}
        <motion.div
          className="flex w-full flex-1 flex-col items-center justify-center px-2"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassText
            className="space-y-4 leading-tight sm:space-y-6"
            variant="secondary"
            weight="light"
          >
            <span className="block text-4xl tracking-wide sm:text-6xl md:text-7xl">
              BUCSSA
            </span>
            <span className="block text-4xl tracking-wide sm:text-6xl md:text-7xl">
              {getThemePack().eventName}
            </span>
          </GlassText>
          <Button variant="outline" size="xl" className="mt-10 max-w-full whitespace-normal text-xl leading-snug sm:mt-14 md:text-3xl" onClick={onStartGame}>
            开始答题, 豪取大奖吧！
          </Button>
        </motion.div>

        {/* 规则沉底，和中间内容留出间距 */}
        <motion.div
          className="mt-8 w-full max-w-[16.5rem] md:max-w-xs mx-auto px-2 sm:mt-10"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="p-2.5 md:p-3 bg-white/10 backdrop-blur-sm rounded-md">
            <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 text-center tracking-wide">
              游戏规则
            </h3>
            <div className="flex flex-col gap-2">
              <div className="text-white font-medium text-xs md:text-sm leading-relaxed">
                每轮限时答题，选择人数较少的选项将晋级下一轮，坚持到最后即可获胜。
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
