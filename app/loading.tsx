import Image from "next/image"

export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-container-padding"
      style={{ backgroundColor: "#505050" }}
    >
      <div className="text-center">
        <div className="relative w-48 h-48 mx-auto mb-6 animate-logo-fade-in">
          <Image src="/habukensetsu-togo.png" alt="羽布建設" fill className="object-contain" priority />
        </div>
        <h2 className="text-heading-md font-semibold text-white">読み込み中...</h2>
        <p className="text-body text-gray-300 mt-2">データを取得しています。しばらくお待ちください。</p>
      </div>
    </div>
  )
}
