export const sampleProjects = [
  {
    id: 1,
    name: "羽布ビル新築工事",
    location: "東京都",
  },
  {
    id: 2,
    name: "羽布マンション改修工事",
    location: "大阪府",
  },
  {
    id: 3,
    name: "羽布橋梁補修工事",
    location: "愛知県",
  },
  {
    id: 4,
    name: "羽布ダム建設工事",
    location: "北海道",
  },
  {
    id: 5,
    name: "羽布トンネル掘削工事",
    location: "福岡県",
  },
]

export const sampleStaff = [
  {
    id: 1,
    name: "羽布太郎",
    position: "現場監督",
  },
  {
    id: 2,
    name: "羽布次郎",
    position: "作業員",
  },
  {
    id: 3,
    name: "羽布花子",
    position: "事務",
  },
  {
    id: 4,
    name: "羽布三郎",
    position: "警備員",
  },
  {
    id: 5,
    name: "羽布四郎",
    position: "職人",
  },
  {
    id: 6,
    name: "羽布五郎",
    position: "重機オペレーター",
  },
]

export const sampleTools = [
  {
    id: 1,
    name: "洗浄機A",
    category: "工具",
    storage_location: "東京資材倉庫",
    assignedProjects: [1, 2],
    assignedStaff: [1, 2],
  },
  {
    id: 2,
    name: "洗浄機B",
    category: "工具",
    storage_location: "大阪資材倉庫",
    assignedProjects: [2, 3],
    assignedStaff: [3],
  },
  {
    id: 3,
    name: "1号車",
    category: "車両",
    storage_location: "名古屋駐車場",
    assignedProjects: [3, 4],
    assignedStaff: [1, 4],
  },
  {
    id: 4,
    name: "2号車",
    category: "車両",
    storage_location: "福岡駐車場",
    assignedProjects: [1, 5],
    assignedStaff: [2, 3],
  },
  {
    id: 5,
    name: "会議室A",
    category: "備品",
    storage_location: "東京本社",
    assignedProjects: [2],
    assignedStaff: [1, 2, 3],
  },
]

export const getAllVacations = () => {
  return [
    { staffId: 1, staffName: "山田太郎", date: new Date(2024, 0, 10), type: "有給" },
    { staffId: 2, staffName: "田中花子", date: new Date(2024, 0, 15), type: "慶弔休暇" },
    { staffId: 1, staffName: "山田太郎", date: new Date(2024, 1, 2), type: "有給" },
  ]
}
