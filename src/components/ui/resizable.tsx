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
}: {
  direction: Direction
  className?: string
  children: React.ReactNode
}) => {
  const groupId = React.useId()
  const [sizes, setSizes] = React.useState<number[]>([])
  const panels = React.useRef<React.RefObject<HTMLDivElement>[]>(
    React.Children.map(children, () => React.createRef())
  ).current

  React.useEffect(() => {
    const childArray = React.Children.toArray(children)
    const initialSizes = childArray.map((child) => {
      if (React.isValidElement(child) && child.props.defaultSize) {
        return child.props.defaultSize
      }
      return 100 / childArray.length
    })
    setSizes(initialSizes)
  }, [children])

  return (
    <ResizablePanelGroupContext.Provider
      value={{ groupId, direction, panels, sizes, setSizes }}
    >
      <div
        className={cn(
          "flex w-full h-full",
          direction === "vertical" && "flex-col",
          className
        )}
      >
        {children}
      </div>
    </ResizablePanelGroupContext.Provider>
  )
}

const ResizablePanel = ({
  children,
  className,
  defaultSize,
  ...props
}: {
  children: React.ReactNode
  className?: string
  defaultSize?: number
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { direction, panels, sizes } = useResizablePanelGroup()
  const panelRef = React.useRef<HTMLDivElement>(null)
  
  const panelIndex = React.useMemo(() => {
    const index = panels.findIndex((p) => p.current === panelRef.current)
    return index > -1 ? index : 0
  }, [panels, panelRef, sizes])
  
  React.useEffect(() => {
    const index = panels.findIndex((p) => p.current === null)
    if(index !== -1 && panelRef.current) {
        panels[index] = panelRef
    }
  }, [panels, panelRef])

  const style: React.CSSProperties = {
    flexGrow: sizes[panelIndex] || defaultSize || 1,
    flexBasis: 0,
    overflow: 'hidden'
  }

  return (
    <div ref={panelRef} className={cn("overflow-hidden", className)} style={style} {...props}>
      {children}
    </div>
  )
}

const ResizableHandle = ({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  const { direction, setSizes } = useResizablePanelGroup()
  const handleRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)

  const onDrag = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !handleRef.current) return

      const handleElement = handleRef.current
      const parentElement = handleElement.parentElement
      if (!parentElement) return
      
      const rect = parentElement.getBoundingClientRect()
      
      let delta
      if (direction === "horizontal") {
        delta = e.clientX - (handleElement.dataset.startPos ? parseFloat(handleElement.dataset.startPos) : e.clientX)
        handleElement.dataset.startPos = `${e.clientX}`
      } else {
        delta = e.clientY - (handleElement.dataset.startPos ? parseFloat(handleElement.dataset.startPos) : e.clientY)
        handleElement.dataset.startPos = `${e.clientY}`
      }

      setSizes(prevSizes => {
          const handleIndex = Array.from(parentElement.children).indexOf(handleElement)
          const prevPanelIndex = Math.floor((handleIndex -1) / 2);
          const nextPanelIndex = prevPanelIndex + 1;
          
          if (prevSizes[prevPanelIndex] === undefined || prevSizes[nextPanelIndex] === undefined) {
              return prevSizes;
          }
          
          const totalSize = prevSizes[prevPanelIndex] + prevSizes[nextPanelIndex];

          const parentSize = direction === 'horizontal' ? rect.width : rect.height;
          const deltaPercent = (delta / parentSize) * 100;
          
          let newPrevSize = prevSizes[prevPanelIndex] + deltaPercent;
          let newNextSize = prevSizes[nextPanelIndex] - deltaPercent;
          
          const minSize = 5; // minimum 5%

          if(newPrevSize < minSize) {
              newNextSize += newPrevSize - minSize;
              newPrevSize = minSize;
          }
          if(newNextSize < minSize) {
              newPrevSize += newNextSize - minSize;
              newNextSize = minSize;
          }

          if (newPrevSize > totalSize - minSize) newPrevSize = totalSize - minSize;
          if (newNextSize > totalSize - minSize) newNextSize = totalSize - minSize;

          const newSizes = [...prevSizes];
          newSizes[prevPanelIndex] = newPrevSize;
          newSizes[nextPanelIndex] = newNextSize;

          return newSizes;
      })

    },
    [direction, setSizes]
  )

  const onDragEnd = React.useCallback(() => {
    isDragging.current = false
    document.removeEventListener("mousemove", onDrag)
    document.removeEventListener("mouseup", onDragEnd)
    if(handleRef.current) handleRef.current.removeAttribute('data-start-pos');
  }, [onDrag])

  const onDragStart = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      if(handleRef.current) {
        handleRef.current.dataset.startPos = `${direction === 'horizontal' ? e.clientX : e.clientY}`;
      }
      document.addEventListener("mousemove", onDrag)
      document.addEventListener("mouseup", onDragEnd)
    },
    [direction, onDrag, onDragEnd]
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
