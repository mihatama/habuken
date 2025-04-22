// 共通のサンプルデータ
export const sampleProjects = [
  {
    id: 1,
    name: "羽布ビル新築工事",
    description: "東京都品川区の商業施設新築",
    startDate: new Date(2025, 3, 1),
    endDate: new Date(2025, 6, 30),
    status: "進行中",
    client: "羽布不動産株式会社",
    location: "東京都品川区",
    assignedStaff: [1, 3, 5],
    assignedTools: [1, 3, 5],
  },
  {
    id: 2,
    name: "羽布マンション改修工事",
    description: "大阪市内の集合住宅改修",
    startDate: new Date(2025, 3, 15),
    endDate: new Date(2025, 8, 30),
    status: "計画中",
    client: "羽布住宅株式会社",
    location: "大阪市中央区",
    assignedStaff: [2, 4],
    assignedTools: [2, 4],
  },
  {
    id: 3,
    name: "羽布橋梁補修工事",
    description: "名古屋市内の橋梁補修プロジェクト",
    startDate: new Date(2025, 4, 1),
    endDate: new Date(2025, 7, 15),
    status: "未着手",
    client: "中部高速道路株式会社",
    location: "名古屋市中区",
    assignedStaff: [1, 2, 6],
    assignedTools: [3, 6],
  },
  {
    id: 4,
    name: "羽布倉庫建設工事",
    description: "福岡市内の物流倉庫建設",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 9, 30),
    status: "計画中",
    client: "羽布物流株式会社",
    location: "福岡市博多区",
    assignedStaff: [3, 5, 7],
    assignedTools: [1, 5, 7],
  },
]

export const sampleStaff = [
  {
    id: 1,
    name: "羽布太郎",
    position: "現場監督",
    email: "taro@habu-kensetsu.co.jp",
    phone: "090-1234-5678",
    skills: ["土木施工管理技士1級", "建築施工管理技士2級", "玉掛け"],
    area: "東京",
    vacations: [
      { date: new Date(2025, 3, 10), type: "有給" },
      { date: new Date(2025, 4, 5), type: "有給" },
    ],
    assignedProjects: [1, 3],
    assignedTools: [3], // 追加：担当する重機
  },
  {
    id: 2,
    name: "羽布次郎",
    position: "作業員",
    email: "jiro@habu-kensetsu.co.jp",
    phone: "090-2345-6789",
    skills: ["玉掛け", "フォークリフト", "高所作業"],
    area: "大阪",
    vacations: [
      { date: new Date(2025, 3, 15), type: "有給" },
      { date: new Date(2025, 3, 16), type: "有給" },
    ],
    assignedProjects: [2, 3],
    assignedTools: [2, 4], // 追加：担当する重機
  },
  {
    id: 3,
    name: "羽布花子",
    position: "設計士",
    email: "hanako@habu-kensetsu.co.jp",
    phone: "090-3456-7890",
    skills: ["一級建築士", "CAD設計"],
    area: "東京",
    vacations: [
      { date: new Date(2025, 5, 1), type: "有給" },
      { date: new Date(2025, 5, 2), type: "有給" },
    ],
    assignedProjects: [1, 4],
    assignedTools: [], // 追加：担当する重機
  },
  {
    id: 4,
    name: "羽布三郎",
    position: "作業員",
    email: "saburo@habu-kensetsu.co.jp",
    phone: "090-4567-8901",
    skills: ["溶接", "型枠", "鉄筋"],
    area: "大阪",
    vacations: [{ date: new Date(2025, 4, 20), type: "有給" }],
    assignedProjects: [2],
    assignedTools: [2], // 追加：担当する重機
  },
  {
    id: 5,
    name: "羽布四郎",
    position: "重機オペレーター",
    email: "shiro@habu-kensetsu.co.jp",
    phone: "090-5678-9012",
    skills: ["車両系建設機械", "大型特殊", "玉掛け"],
    area: "東京",
    vacations: [],
    assignedProjects: [1, 4],
    assignedTools: [1, 3, 5], // 追加：担当する重機
  },
  {
    id: 6,
    name: "羽布五郎",
    position: "電気工事士",
    email: "goro@habu-kensetsu.co.jp",
    phone: "090-6789-0123",
    skills: ["第一種電気工事士", "第二種電気工事士"],
    area: "名古屋",
    vacations: [{ date: new Date(2025, 6, 10), type: "有給" }],
    assignedProjects: [3],
    assignedTools: [6], // 追加：担当する重機
  },
  {
    id: 7,
    name: "羽布六郎",
    position: "配管工",
    email: "rokuro@habu-kensetsu.co.jp",
    phone: "090-7890-1234",
    skills: ["配管技能士", "給水装置工事主任技術者"],
    area: "福岡",
    vacations: [
      { date: new Date(2025, 5, 15), type: "有給" },
      { date: new Date(2025, 5, 16), type: "有給" },
    ],
    assignedProjects: [4],
    assignedTools: [7], // 追加：担当する重機
  },
]

// サンプルデータのカテゴリを更新
export const sampleTools = [
  {
    id: 1,
    name: "バックホウA",
    category: "重機",
    location: "東京倉庫",
    status: "利用可能",
    lastMaintenance: new Date(2025, 2, 15),
    assignedProjects: [1, 4],
    assignedStaff: [5],
  },
  {
    id: 2,
    name: "ダンプトラックA",
    category: "車両",
    location: "大阪倉庫",
    status: "利用中",
    lastMaintenance: new Date(2025, 1, 20),
    assignedProjects: [2],
    assignedStaff: [2, 4],
  },
  {
    id: 3,
    name: "クレーンA",
    category: "重機",
    location: "東京倉庫",
    status: "メンテナンス中",
    lastMaintenance: new Date(2025, 3, 5),
    assignedProjects: [1, 3],
    assignedStaff: [1, 5],
  },
  {
    id: 4,
    name: "フォークリフトA",
    category: "重機",
    location: "大阪倉庫",
    status: "利用可能",
    lastMaintenance: new Date(2025, 2, 10),
    assignedProjects: [2],
    assignedStaff: [2],
  },
  {
    id: 5,
    name: "ブルドーザーA",
    category: "重機",
    location: "東京倉庫",
    status: "利用可能",
    lastMaintenance: new Date(2025, 3, 1),
    assignedProjects: [1, 4],
    assignedStaff: [5],
  },
  {
    id: 6,
    name: "高所作業車A",
    category: "車両",
    location: "名古屋倉庫",
    status: "利用可能",
    lastMaintenance: new Date(2025, 2, 25),
    assignedProjects: [3],
    assignedStaff: [6],
  },
  {
    id: 7,
    name: "発電機A",
    category: "工具",
    location: "福岡倉庫",
    status: "利用可能",
    lastMaintenance: new Date(2025, 3, 10),
    assignedProjects: [4],
    assignedStaff: [7],
  },
]

// 休暇申請のモックデータ
export let leaveRequests = [
  {
    id: 1,
    userId: 1,
    userName: "羽布太郎",
    leaveType: "paid",
    startDate: new Date(2025, 3, 10),
    endDate: new Date(2025, 3, 10),
    reason: "私用のため",
    status: "approved",
    rejectReason: "",
    createdAt: new Date(2025, 3, 1),
  },
  {
    id: 2,
    userId: 2,
    userName: "羽布次郎",
    leaveType: "paid",
    startDate: new Date(2025, 3, 15),
    endDate: new Date(2025, 3, 16),
    reason: "家族旅行のため",
    status: "approved",
    rejectReason: "",
    createdAt: new Date(2025, 3, 5),
  },
  {
    id: 3,
    userId: 3,
    userName: "羽布花子",
    leaveType: "special",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 2),
    reason: "結婚式出席のため",
    status: "pending",
    rejectReason: "",
    createdAt: new Date(2025, 4, 20),
  },
  {
    id: 4,
    userId: 4,
    userName: "羽布三郎",
    leaveType: "compensatory",
    startDate: new Date(2025, 4, 20),
    endDate: new Date(2025, 4, 20),
    reason: "先週の休日出勤の振替",
    status: "pending",
    rejectReason: "",
    createdAt: new Date(2025, 4, 15),
  },
  {
    id: 5,
    userId: 5,
    userName: "羽布四郎",
    leaveType: "absent",
    startDate: new Date(2025, 3, 25),
    endDate: new Date(2025, 3, 25),
    reason: "体調不良のため",
    status: "rejected",
    rejectReason: "人員不足のため別日での調整をお願いします",
    createdAt: new Date(2025, 3, 24),
  },
]

// 休暇データを集約（承認された休暇申請も含める）
export const getAllVacations = () => {
  const vacations: { staffId: number; staffName: string; date: Date; type: string }[] = []

  // スタッフの休暇データを追加
  sampleStaff.forEach((staff) => {
    staff.vacations.forEach((vacation) => {
      vacations.push({
        staffId: staff.id,
        staffName: staff.name,
        date: vacation.date,
        type: vacation.type,
      })
    })
  })

  // 承認された休暇申請を追加
  leaveRequests
    .filter((request) => request.status === "approved")
    .forEach((request) => {
      // 開始日から終了日までの各日を追加
      const currentDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)

      while (currentDate <= endDate) {
        vacations.push({
          staffId: request.userId,
          staffName: request.userName,
          date: new Date(currentDate),
          type: getLeaveTypeName(request.leaveType),
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

  return vacations.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// 休暇申請を更新する関数
export const updateLeaveRequest = (updatedRequest) => {
  leaveRequests = leaveRequests.map((request) => (request.id === updatedRequest.id ? updatedRequest : request))

  // 承認された場合、対応するスタッフの休暇データを更新
  if (updatedRequest.status === "approved") {
    addVacationFromApprovedRequest(updatedRequest)
  }
}

// 承認された休暇申請からスタッフの休暇データを追加
export const addVacationFromApprovedRequest = (approvedRequest) => {
  const staffIndex = sampleStaff.findIndex((staff) => staff.id === approvedRequest.userId)
  if (staffIndex === -1) return

  // 開始日から終了日までの各日を追加
  const currentDate = new Date(approvedRequest.startDate)
  const endDate = new Date(approvedRequest.endDate)

  while (currentDate <= endDate) {
    // 既存の休暇と重複していないか確認
    const existingVacation = sampleStaff[staffIndex].vacations.find((v) => v.date.getTime() === currentDate.getTime())

    if (!existingVacation) {
      sampleStaff[staffIndex].vacations.push({
        date: new Date(currentDate),
        type: getLeaveTypeName(approvedRequest.leaveType),
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }
}

// 休暇種類の名前を取得
export const getLeaveTypeName = (type: string) => {
  switch (type) {
    case "paid":
      return "有給"
    case "compensatory":
      return "振替休日"
    case "special":
      return "特別休暇"
    case "absent":
      return "欠勤"
    default:
      return type
  }
}

// ヘルパー関数：データ取得を改善
export const getProjectById = (projectId: number) => {
  return sampleProjects.find((project) => project.id === projectId)
}

export const getStaffById = (staffId: number) => {
  return sampleStaff.find((staff) => staff.id === staffId)
}

export const getToolById = (toolId: number) => {
  return sampleTools.find((tool) => tool.id === toolId)
}
