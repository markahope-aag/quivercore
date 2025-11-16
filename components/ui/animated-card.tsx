'use client'

import { motion } from 'framer-motion'
import { Card } from './card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  delay?: number
  hover?: boolean
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
    >
      <Card
        className={cn(
          'transition-all duration-300',
          hover && 'hover:border-primary/50',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}
