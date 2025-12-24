"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

// We are not using the official react-resizable-panels because of some issues with Next.js App Router.
// This is a simplified implementation that works for our use case.

type Direction = "horizontal" | "vertical"

interface ResizablePanelGroupContextProps {
  groupId: string
  direction: Direction
  panels: React.RefObject<HTMLDivElement>[]
  sizes: number[]
  setSizes: React.Dispatch<React.SetStateAction<number[]>>
}

const ResizablePanelGroupContext = React.createContext<
  ResizablePanelGroupContextProps | undefined
>(undefined)

const useResizablePanelGroup = () => {
  const context = React.useContext(ResizablePanelGroupContext)
  if (!context) {
    throw new Error(
      "useResizablePanelGroup must be used within a ResizablePanelGroup"
    )
  }
  return context
}

const ResizablePanelGroup = ({
  direction,
  className,
  children,
  storageId,
}: {
  direction: Direction
  className?: string
  children: React.ReactNode
  storageId?: string
}) => {
  const groupId = React.useId()
  const [sizes, setSizes] = React.useState<number[]>([])
  const panels = React.useRef<React.RefObject<HTMLDivElement>[]>(
    React.Children.map(children, () => React.createRef())
  ).current

  React.useEffect(() => {
    const childArray = React.Children.toArray(children);
    let initialSizes = childArray.map((child) => {
      if (React.isValidElement(child) && child.props.defaultSize) {
        return child.props.defaultSize
      }
      return 100 / childArray.filter(c => React.isValidElement(c) && c.type === ResizablePanel).length
    });

    if (storageId && typeof window !== 'undefined') {
        const storedSizes = localStorage.getItem(storageId);
        if (storedSizes) {
            try {
                const parsedSizes = JSON.parse(storedSizes);
                if (Array.isArray(parsedSizes) && parsedSizes.length === initialSizes.length) {
                    initialSizes = parsedSizes;
                }
            } catch (e) {
                console.error("Failed to parse stored panel sizes:", e);
            }
        }
    }
    setSizes(initialSizes)
  }, [children, storageId])

  const handleSetSizes = React.useCallback((newSizes: number[] | ((prev: number[]) => number[])) => {
    setSizes(prevSizes => {
        const resolvedSizes = typeof newSizes === 'function' ? newSizes(prevSizes) : newSizes;
        if (storageId && typeof window !== 'undefined') {
            localStorage.setItem(storageId, JSON.stringify(resolvedSizes));
        }
        return resolvedSizes;
    });
  }, [storageId]);

  return (
    <ResizablePanelGroupContext.Provider
      value={{ groupId, direction, panels, sizes, setSizes: handleSetSizes }}
    >
      <div
        className={cn(
          "flex w-full h-full",
          direction === "vertical" && "flex-col",
          className
        )}
      >
        {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null;
            if (child.type === ResizablePanel) {
                return React.cloneElement(child as React.ReactElement<any>, { panelIndex: Math.floor(index / 2) });
            }
            if (child.type === ResizableHandle) {
                return React.cloneElement(child as React.ReactElement<any>, { handleIndex: Math.floor((index - 1) / 2) });
            }
            return child;
        })}
      </div>
    </ResizablePanelGroupContext.Provider>
  )
}

const ResizablePanel = ({
  children,
  className,
  defaultSize,
  panelIndex,
  minSize,
  ...props
}: {
  children: React.ReactNode
  className?: string
  defaultSize?: number
  panelIndex?: number
  minSize?: number
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { sizes } = useResizablePanelGroup()
  const ref = React.useRef<HTMLDivElement>(null)
  
  const size = sizes[panelIndex!] ?? defaultSize;
  const style: React.CSSProperties = {
    flexGrow: size,
    flexBasis: 0,
    flexShrink: 0,
    overflow: 'hidden'
  }

  return (
    <div ref={ref} className={cn("overflow-hidden", className)} style={style} {...props}>
      {children}
    </div>
  )
}

const ResizableHandle = ({
  className,
  handleIndex,
  ...props
}: { className?: string, handleIndex?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  const { direction, setSizes, panels } = useResizablePanelGroup()
  const handleRef = React.useRef<HTMLDivElement>(null)

  const onDrag = React.useCallback(
    (e: MouseEvent) => {
      if (!handleRef.current) return;

      const handleElement = handleRef.current;
      const parentElement = handleElement.parentElement;
      if (!parentElement) return;
      
      const prevPanelIndex = handleIndex!;
      const nextPanelIndex = handleIndex! + 1;

      const prevPanel = parentElement.children[prevPanelIndex * 2] as HTMLElement;
      const nextPanel = parentElement.children[nextPanelIndex * 2] as HTMLElement;

      if (!prevPanel || !nextPanel) return;
      
      const rect = parentElement.getBoundingClientRect();
      const handleRect = handleElement.getBoundingClientRect();

      let delta;
      const parentSize = direction === 'horizontal' ? rect.width : rect.height;
      
      if (direction === "horizontal") {
        delta = e.clientX - handleRect.left;
      } else {
        delta = e.clientY - handleRect.top;
      }

      setSizes(prevSizes => {
          const totalSize = prevSizes[prevPanelIndex] + prevSizes[nextPanelIndex];
          const prevPanelSize = (direction === 'horizontal' ? prevPanel.offsetWidth : prevPanel.offsetHeight);
          
          const deltaPercent = ((prevPanelSize + delta) / parentSize) * totalSize;

          let newPrevSize = deltaPercent;
          let newNextSize = totalSize - newPrevSize;
          
          // Get minSize from props of ResizablePanel
          const childArray = React.Children.toArray(parentElement.props.children);
          const prevPanelElement = childArray[prevPanelIndex * 2] as React.ReactElement;
          const nextPanelElement = childArray[nextPanelIndex * 2] as React.ReactElement;
          
          const minPrev = (prevPanelElement.props.minSize || 5);
          const minNext = (nextPanelElement.props.minSize || 5);

          if(newPrevSize < minPrev) {
              newNextSize += newPrevSize - minPrev;
              newPrevSize = minPrev;
          }
          if(newNextSize < minNext) {
              newPrevSize += newNextSize - minNext;
              newNextSize = minNext;
          }

          const newSizes = [...prevSizes];
          newSizes[prevPanelIndex] = newPrevSize;
          newSizes[nextPanelIndex] = newNextSize;

          return newSizes;
      })
    },
    [direction, setSizes, handleIndex]
  )

  const onDragEnd = React.useCallback(() => {
    document.removeEventListener("mousemove", onDrag)
    document.removeEventListener("mouseup", onDragEnd)
  }, [onDrag])

  const onDragStart = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      document.addEventListener("mousemove", onDrag)
      document.addEventListener("mouseup", onDragEnd)
    },
    [onDrag, onDragEnd]
  )

  return (
    <div
      ref={handleRef}
      onMouseDown={onDragStart}
      className={cn(
        "flex items-center justify-center bg-border relative",
        direction === "horizontal"
          ? "w-2 cursor-col-resize"
          : "h-2 cursor-row-resize",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "z-10 flex items-center justify-center rounded-sm bg-muted-foreground/20 p-0.5 opacity-50 transition-opacity hover:opacity-100",
          direction === "horizontal" ? "h-8" : "w-8 flex-col"
        )}
      >
        <GripVertical className={cn("h-3 w-3", direction === "vertical" && "rotate-90")} />
      </div>
    </div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
