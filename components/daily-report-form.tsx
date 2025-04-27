"use client"

import { useState, useEffect } from "react"
import { TextField, SelectField, Input } from "@aws-amplify/ui-react"
import { API } from "aws-amplify"
import { createDailyReport } from "../graphql/mutations"
import { listDailyReports } from "../graphql/queries"

interface DailyReport {
  id?: string
  date: string
  weather: string
  temperature: number
  weatherDescription: string
  weatherIcon: string
  activity: string
  feeling: string
  learned: string
  tomorrow: string
}

interface WeatherOption {
  value: string
  label: string
  icon: string
}

const weatherOptions: WeatherOption[] = [
  { value: "sunny", label: "晴れ", icon: "sunny" },
  { value: "cloudy", label: "曇り", icon: "cloudy" },
  { value: "rainy", label: "雨", icon: "rainy" },
  { value: "thunderstorm", label: "雷雨", icon: "thunderstorm" },
  { value: "snowy", label: "雪", icon: "snowy" },
]

const WeatherIcon = ({ weather, size = "sm" }: { weather: string; size?: "sm" | "md" | "lg" }) => {
  let iconSize = "w-6 h-6"
  if (size === "md") iconSize = "w-12 h-12"
  if (size === "lg") iconSize = "w-24 h-24"

  switch (weather) {
    case "sunny":
      return <img src="/icons/sunny.svg" alt="晴れ" className={iconSize} />
    case "cloudy":
      return <img src="/icons/cloudy.svg" alt="曇り" className={iconSize} />
    case "rainy":
      return <img src="/icons/rainy.svg" alt="雨" className={iconSize} />
    case "thunderstorm":
      return <img src="/icons/thunderstorm.svg" alt="雷雨" className={iconSize} />
    case "snowy":
      return <img src="/icons/snowy.svg" alt="雪" className={iconSize} />
    default:
      return <img src="/icons/sunny.svg" alt="晴れ" className={iconSize} />
  }
}

const DailyReportForm = () => {
  const [formData, setFormData] = useState<DailyReport>({
    date: new Date().toISOString().slice(0, 10),
    weather: "sunny",
    temperature: 20,
    weatherDescription: "晴れ",
    weatherIcon: "sunny",
    activity: "",
    feeling: "",
    learned: "",
    tomorrow: "",
  })

  const [reports, setReports] = useState<DailyReport[]>([])

  useEffect(() => {
    // 天気APIの呼び出しを削除し、デフォルト値を設定
    setFormData((prev) => ({
      ...prev,
      weather: "sunny", // デフォルト値を設定
      temperature: 20, // デフォルト値を設定
      weatherDescription: "晴れ",
      weatherIcon: "sunny",
    }))
  }, [])

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    const apiData = await API.graphql({ query: listDailyReports })
    const reportsFromAPI = (apiData as any).data.listDailyReports.items
    setReports(reportsFromAPI)
  }

  async function createReport() {
    if (
      !formData.date ||
      !formData.weather ||
      !formData.activity ||
      !formData.feeling ||
      !formData.learned ||
      !formData.tomorrow
    )
      return
    await API.graphql({
      query: createDailyReport,
      variables: { input: formData },
    })
    setReports([...reports, formData])
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      weather: "sunny",
      temperature: 20,
      weatherDescription: "晴れ",
      weatherIcon: "sunny",
      activity: "",
      feeling: "",
      learned: "",
      tomorrow: "",
    })
    fetchReports()
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Daily Report</h2>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="date"
            label="日付"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value })}
            type="date"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-1">
                天候
              </label>
              <SelectField
                id="weather"
                label=""
                value={formData.weather}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    weather: value,
                    weatherDescription: weatherOptions.find((opt) => opt.value === value)?.label || "",
                  })
                }
                options={weatherOptions}
                icon={<WeatherIcon weather={formData.weather as any} />}
              />
            </div>
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                気温 (°C)
              </label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature.toString()}
                onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <TextField
            id="activity"
            label="今日の活動"
            value={formData.activity}
            onChange={(value) => setFormData({ ...formData, activity: value })}
          />
        </div>
        <div className="mb-4">
          <TextField
            id="feeling"
            label="今日の気分"
            value={formData.feeling}
            onChange={(value) => setFormData({ ...formData, feeling: value })}
          />
        </div>
        <div className="mb-4">
          <TextField
            id="learned"
            label="今日学んだこと"
            value={formData.learned}
            onChange={(value) => setFormData({ ...formData, learned: value })}
          />
        </div>
        <div className="mb-4">
          <TextField
            id="tomorrow"
            label="明日の予定"
            value={formData.tomorrow}
            onChange={(value) => setFormData({ ...formData, tomorrow: value })}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={createReport}
        >
          Create Report
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Reports</h2>
        <div className="grid grid-cols-4 gap-4">
          {reports.map((report, index) => (
            <div key={report.id || index} className="border rounded p-4">
              <div className="font-bold">{report.date}</div>
              {/* 天気情報表示部分を修正 */}
              <div className="col-span-1 border-r border-gray-300 p-2 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-bold">天候</div>
                  <div className="flex flex-col items-center">
                    <WeatherIcon weather={report.weather as any} size="md" />
                    <div className="text-sm mt-1">{report.temperature}°C</div>
                  </div>
                </div>
              </div>
              <div>活動: {report.activity}</div>
              <div>気分: {report.feeling}</div>
              <div>学んだこと: {report.learned}</div>
              <div>明日の予定: {report.tomorrow}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DailyReportForm
