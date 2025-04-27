/**
 * 所有形態の列挙型
 */
export enum OwnershipType {
  OwnedByCompany = "自社保有",
  Leased = "リース",
  Other = "その他",
}

/**
 * リソースの状態の列挙型
 */
export enum ResourceStatus {
  Available = "利用可能",
  InUse = "利用中",
  UnderMaintenance = "メンテナンス中",
}

/**
 * プロジェクトの状態の列挙型
 */
export enum ProjectStatus {
  NotStarted = "未着手",
  Planning = "計画中",
  InProgress = "進行中",
  Completed = "完了",
}

/**
 * イベントタイプの列挙型
 */
export enum EventType {
  Project = "project",
  Staff = "staff",
  Tool = "tool",
  General = "general",
}
