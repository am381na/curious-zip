import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

const SliderBase = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  // Always render exactly two thumbs for range behavior.
  const thumbCount = 2;

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value as number[] | undefined}
      defaultValue={defaultValue as number[] | undefined}
      className={"relative flex w-full touch-none select-none items-center " + (className ?? "")}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-200">
        <SliderPrimitive.Range className="absolute h-full bg-neutral-900" />
      </SliderPrimitive.Track>

      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-5 w-5 rounded-full border border-neutral-300 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
SliderBase.displayName = SliderPrimitive.Root.displayName;

// 🔒 Prevent re-renders while dragging
export const Slider = React.memo(SliderBase);
