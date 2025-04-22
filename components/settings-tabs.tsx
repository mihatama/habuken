"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Define the props interface
interface SettingsTabsProps {
  items?: Array<{
    title: string
    href: string
  }>
}

// Define the component
function SettingsTabsComponent({ items = [] }: SettingsTabsProps) {
  const pathname = usePathname()
  const [calendarSettings, setCalendarSettings] = useState({
    showStaffNames: true,
    showProjectDetails: true,
    showToolInfo: true,
    defaultView: "month",
  })

  const [displaySettings, setDisplaySettings] = useState({
    staffView: true,
    projectView: true,
    resourceView: true,
    timelineView: true,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    scheduleChanges: true,
    shiftAssignments: true,
    projectUpdates: true,
    resourceAllocation: false,
    dailyDigest: true,
    weeklyReport: true,
  })

  const [userSettings, setUserSettings] = useState({
    language: "ja",
    timeFormat: "24",
    startOfWeek: "monday",
  })

  // ナビゲーションタブを表示
  return (
    <div className="space-y-6">
      <nav className="flex border-b">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* 既存の設定タブコンテンツ */}
      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="display" className="py-3">
            表示設定
          </TabsTrigger>
          <TabsTrigger value="calendar" className="py-3">
            カレンダー設定
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-3">
            通知設定
          </TabsTrigger>
          <TabsTrigger value="user" className="py-3">
            ユーザー設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>表示設定</CardTitle>
              <CardDescription>
                カレンダー画面にどの項目を表示するか、各社ごとに自由にカスタマイズできます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="staff-view">スタッフビュー</Label>
                    <p className="text-sm text-muted-foreground">スタッフごとのスケジュール表示を有効にします</p>
                  </div>
                  <Switch
                    id="staff-view"
                    checked={displaySettings.staffView}
                    onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, staffView: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="project-view">案件ビュー</Label>
                    <p className="text-sm text-muted-foreground">案件ごとのスケジュール表示を有効にします</p>
                  </div>
                  <Switch
                    id="project-view"
                    checked={displaySettings.projectView}
                    onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, projectView: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="resource-view">リソースビュー</Label>
                    <p className="text-sm text-muted-foreground">リソースごとのスケジュール表示を有効にします</p>
                  </div>
                  <Switch
                    id="resource-view"
                    checked={displaySettings.resourceView}
                    onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, resourceView: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timeline-view">タイムラインビュー</Label>
                    <p className="text-sm text-muted-foreground">タイムライン形式のスケジュール表示を有効にします</p>
                  </div>
                  <Switch
                    id="timeline-view"
                    checked={displaySettings.timelineView}
                    onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, timelineView: checked })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>カレンダー設定</CardTitle>
              <CardDescription>
                カレンダーの表示方法や繰り返し設定など、カレンダーに関する設定を行います。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="default-view">デフォルト表示</Label>
                      <Select
                        value={calendarSettings.defaultView}
                        onValueChange={(value) => setCalendarSettings({ ...calendarSettings, defaultView: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="表示形式を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">日</SelectItem>
                          <SelectItem value="week">週</SelectItem>
                          <SelectItem value="month">月</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="business-days">営業日</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {["月", "火", "水", "木", "金", "土", "日"].map((day, index) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox id={`day-${index}`} defaultChecked={index < 5} />
                            <label
                              htmlFor={`day-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-staff-names">スタッフ名表示</Label>
                        <p className="text-sm text-muted-foreground">カレンダー上にスタッフ名を表示します</p>
                      </div>
                      <Switch
                        id="show-staff-names"
                        checked={calendarSettings.showStaffNames}
                        onCheckedChange={(checked) =>
                          setCalendarSettings({ ...calendarSettings, showStaffNames: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-project-details">案件詳細表示</Label>
                        <p className="text-sm text-muted-foreground">カレンダー上に案件の詳細情報を表示します</p>
                      </div>
                      <Switch
                        id="show-project-details"
                        checked={calendarSettings.showProjectDetails}
                        onCheckedChange={(checked) =>
                          setCalendarSettings({ ...calendarSettings, showProjectDetails: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-tool-info">ツール情報表示</Label>
                        <p className="text-sm text-muted-foreground">カレンダー上にツール情報を表示します</p>
                      </div>
                      <Switch
                        id="show-tool-info"
                        checked={calendarSettings.showToolInfo}
                        onCheckedChange={(checked) =>
                          setCalendarSettings({ ...calendarSettings, showToolInfo: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>どのような通知を受け取るか、通知方法を設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">メール通知</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="schedule-changes">スケジュール変更</Label>
                      <p className="text-sm text-muted-foreground">
                        スケジュールが作成または変更された時に通知を受け取ります
                      </p>
                    </div>
                    <Switch
                      id="schedule-changes"
                      checked={notificationSettings.scheduleChanges}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, scheduleChanges: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shift-assignments">シフト割り当て</Label>
                      <p className="text-sm text-muted-foreground">シフトに割り当てられた時に通知を受け取ります</p>
                    </div>
                    <Switch
                      id="shift-assignments"
                      checked={notificationSettings.shiftAssignments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, shiftAssignments: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="project-updates">案件更新</Label>
                      <p className="text-sm text-muted-foreground">
                        案件のステータスが変更された時に通知を受け取ります
                      </p>
                    </div>
                    <Switch
                      id="project-updates"
                      checked={notificationSettings.projectUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, projectUpdates: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="resource-allocation">リソース割り当て</Label>
                      <p className="text-sm text-muted-foreground">リソースが割り当てられた時に通知を受け取ります</p>
                    </div>
                    <Switch
                      id="resource-allocation"
                      checked={notificationSettings.resourceAllocation}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, resourceAllocation: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">サマリーレポート</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-digest">デイリーダイジェスト</Label>
                      <p className="text-sm text-muted-foreground">
                        1日のすべてのアクティビティのサマリーを受け取ります
                      </p>
                    </div>
                    <Switch
                      id="daily-digest"
                      checked={notificationSettings.dailyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, dailyDigest: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-report">週次レポート</Label>
                      <p className="text-sm text-muted-foreground">案件の進捗状況の週次サマリーを受け取ります</p>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>ユーザー設定</CardTitle>
              <CardDescription>言語や時間形式などの個人設定を行います。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="language">言語</Label>
                  <Select
                    value={userSettings.language}
                    onValueChange={(value) => setUserSettings({ ...userSettings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="言語を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time-format">時間形式</Label>
                  <Select
                    value={userSettings.timeFormat}
                    onValueChange={(value) => setUserSettings({ ...userSettings, timeFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="時間形式を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12時間制 (AM/PM)</SelectItem>
                      <SelectItem value="24">24時間制</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-of-week">週の開始日</Label>
                  <Select
                    value={userSettings.startOfWeek}
                    onValueChange={(value) => setUserSettings({ ...userSettings, startOfWeek: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="週の開始日を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">日曜日</SelectItem>
                      <SelectItem value="monday">月曜日</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Export the component
export { SettingsTabsComponent as SettingsTabs }
