import { cn } from "./utils"

/**
 * レスポンシブなコンテナクラスを生成
 * @param className 追加のクラス名
 */
export function containerClass(className?: string) {
  return cn("container px-4 md:px-6 lg:px-8", className)
}

/**
 * レスポンシブなグリッドクラスを生成
 * @param cols モバイルのカラム数
 * @param mdCols タブレットのカラム数
 * @param lgCols デスクトップのカラム数
 * @param gap ギャップサイズ
 * @param className 追加のクラス名
 */
export function gridClass(cols = 1, mdCols = 2, lgCols = 3, gap = "gap-4", className?: string) {
  return cn("grid", `grid-cols-${cols}`, `md:grid-cols-${mdCols}`, `lg:grid-cols-${lgCols}`, gap, className)
}

/**
 * レスポンシブなフレックスクラスを生成
 * @param direction モバイルの方向
 * @param mdDirection タブレットの方向
 * @param gap ギャップサイズ
 * @param className 追加のクラス名
 */
export function flexClass(
  direction: "row" | "col" = "col",
  mdDirection: "row" | "col" = "row",
  gap = "gap-4",
  className?: string,
) {
  return cn("flex", `flex-${direction}`, `md:flex-${mdDirection}`, gap, className)
}

/**
 * 見出しクラスを生成
 * @param level 見出しレベル (1-6)
 * @param className 追加のクラス名
 */
export function headingClass(level: 1 | 2 | 3 | 4 | 5 | 6, className?: string) {
  const baseClass = `h${level}`
  return cn(baseClass, className)
}

/**
 * テキストクラスを生成
 * @param variant テキストバリアント
 * @param className 追加のクラス名
 */
export function textClass(variant: "lead" | "large" | "small" | "muted" | "base" = "base", className?: string) {
  const variantClass = variant === "base" ? "text-base" : variant
  return cn(variantClass, className)
}
