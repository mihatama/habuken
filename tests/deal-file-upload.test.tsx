import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DealFileUpload } from "@/components/deal-file-upload"
import { toast } from "@/components/ui/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

// Mock dependencies
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

jest.mock("@/lib/supabase-utils", () => ({
  getClientSupabase: jest.fn(),
}))

jest.mock("uuid", () => ({
  v4: () => "test-uuid",
}))

// Mock react-dropzone
jest.mock("react-dropzone", () => ({
  useDropzone: () => ({
    getRootProps: () => ({
      onClick: jest.fn(),
    }),
    getInputProps: () => ({
      onChange: jest.fn(),
    }),
    isDragActive: false,
  }),
}))

describe("DealFileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the dropzone", () => {
    render(<DealFileUpload />)

    expect(screen.getByText(/ファイルをドラッグ＆ドロップするか/)).toBeInTheDocument()
    expect(screen.getByText(/PDFまたは画像ファイル/)).toBeInTheDocument()
  })

  it("shows error toast when file is too large", async () => {
    const mockSupabase = {
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn().mockResolvedValue({ data: { path: "test-path" }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://test-url.com" } }),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    }

    // @ts-ignore - Mocking
    getClientSupabase.mockReturnValue(mockSupabase)

    const { container } = render(<DealFileUpload dealId="test-deal-id" />)

    // Create a file that's too large (21MB)
    const largeFile = new File([""], "large-file.pdf", { type: "application/pdf" })
    Object.defineProperty(largeFile, "size", { value: 21 * 1024 * 1024 })

    // Simulate file drop
    const dropzone = container.querySelector("div")
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [largeFile],
      },
    })

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "ファイルサイズエラー",
          variant: "destructive",
        }),
      )
    })
  })
})
