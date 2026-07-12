import { gsap } from "gsap";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { sva } from "styled-system/css";

export type PullToRefreshProps = {
  children: ReactNode;
  onRefresh: () => Promise<void>;
};

const PULL_THRESHOLD = 100;
const MAX_PULL = 180;
const START_Y = -60;
const TARGET_Y = 40;
const CIRCLE_RADIUS = 8;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const recipe = sva({
  base: {
    container: {
      height: "full",
      position: "relative",
      width: "full",
    },
    icon: {
      transform: "rotate(-90deg)",
    },
    indicator: {
      alignItems: "center",
      backdropFilter: "blur(8px)",
      bg: "white/90",
      border: "1px solid token(colors.neutral.200)",
      borderRadius: "full",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      display: "flex",
      height: "10",
      justifyContent: "center",
      left: "50%",
      pointerEvents: "none",
      position: "absolute",
      top: "0",
      transform: "translate(-50%, -60px)",
      width: "10",
      zIndex: "overlay",
    },
  },
  slots: ["container", "icon", "indicator"],
  variants: {
    loading: {
      true: {
        icon: {
          animation: "spin 1s linear infinite",
        },
      },
    },
  },
});

export const PullToRefresh: FC<PullToRefreshProps> = ({
  children,
  onRefresh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);

  const classes = recipe({ loading: isLoading });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > 0 || isLoading) return;

      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      isPullingRef.current = true;
      pullDistanceRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isLoading) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;

      const deltaY = currentY - startYRef.current;
      const deltaX = currentX - startXRef.current;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        isPullingRef.current = false;

        return;
      }

      if (deltaY > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const pull = Math.min(MAX_PULL, deltaY * 0.55);
        pullDistanceRef.current = pull;
        const progress = Math.min(1, pull / PULL_THRESHOLD);

        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(
            CIRCUMFERENCE * (1 - progress),
          );
        }

        const y = START_Y + progress * (TARGET_Y - START_Y);

        gsap.set(indicatorRef.current, {
          opacity: progress,
          rotation: progress * 360,
          scale: 0.5 + progress * 0.5,
          y,
        });
      } else {
        isPullingRef.current = false;
        pullDistanceRef.current = 0;

        gsap.to(indicatorRef.current, {
          duration: 0.3,
          ease: "power2.out",
          opacity: 0,
          scale: 0.5,
          y: START_Y,
        });
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isLoading) return;

      isPullingRef.current = false;

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        setIsLoading(true);

        gsap.to(indicatorRef.current, {
          duration: 0.2,
          ease: "power2.out",
          opacity: 1,
          scale: 1,
          y: TARGET_Y,
        });

        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(
            CIRCUMFERENCE * 0.3,
          );
        }

        try {
          await onRefresh();
        } finally {
          setIsLoading(false);

          gsap.to(indicatorRef.current, {
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              if (circleRef.current) {
                circleRef.current.style.strokeDashoffset =
                  String(CIRCUMFERENCE);
              }
            },
            opacity: 0,
            scale: 0.5,
            y: START_Y,
          });
        }
      } else {
        gsap.to(indicatorRef.current, {
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            if (circleRef.current) {
              circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
            }
          },
          opacity: 0,
          scale: 0.5,
          y: START_Y,
        });
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isLoading, onRefresh]);

  return (
    <div className={classes.container} ref={containerRef}>
      <div className={classes.indicator} ref={indicatorRef}>
        <svg
          className={classes.icon}
          height="20"
          viewBox="0 0 20 20"
          width="20"
        >
          <circle
            cx="10"
            cy="10"
            fill="transparent"
            r={CIRCLE_RADIUS}
            stroke="var(--colors-neutral-200)"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            fill="transparent"
            r={CIRCLE_RADIUS}
            ref={circleRef}
            stroke="var(--colors-neutral-600)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>
      {children}
    </div>
  );
};
