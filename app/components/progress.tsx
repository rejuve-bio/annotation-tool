import { useEffect, useRef } from "react";

interface ProgressProps {
  small?: boolean;
  value?: number;
  className?: string;
}

function Progress(props: ProgressProps) {
  const bar = useRef<HTMLDivElement>(null);
  const size = props.small ? "w-8 h-6" : "w-[400px] h-8";
  let wrapperClass = `relative ${size} ${props.className}`;
  if (props.value === undefined) wrapperClass += " indeterminate";

  let barClass = "progress absolute h-full w-full bg-fuchsia-500";
  if (!props.small) barClass += " progress-lg slow";

  useEffect(() => {
    if (bar.current) {
      bar.current.style.clipPath = `ellipse(${props.value}% 100px at 0% 50%)`;
    }
  }, [props.value]);

  return (
    <div className={wrapperClass}>
      <div className={barClass + " bg-fuchsia-500/20"}></div>
      <div ref={bar} className={barClass}></div>
    </div>
  );
}

export default Progress;
